﻿namespace Game.Util.Commands
{
    using Game.Robots;
    using McMaster.Extensions.CommandLineUtils;
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Numerics;
    using System.Threading.Tasks;

    [Subcommand("robots", typeof(Robots))]
    class PlayerCommand : CommandBase
    {
        class Robots : CommandBase
        {
            [Option]
            public string World { get; set; } = null;

            [Option]
            public int Replicas { get; set; } = 1;

            [Option]
            public bool Firing { get; set; } = false;

            [Option]
            public string Name { get; set; } = null;

            [Option]
            public string Target { get; set; } = "";

            [Option]
            public string Color { get; set; } = null;

            [Option]
            public string Sprite { get; set; } = null;

            [Option]
            public bool Variation { get; set; } = false;

            [Option("--type-name")]
            public string TypeName { get; set; } = null;

            [Option("--startup-delay")]
            public int StartupDelay { get; set; } = 0;

            [Option("--file")]
            public string File { get; set; } = "config.json";

            protected async override Task ExecuteAsync()
            {
                if (StartupDelay > 0)
                    await Task.Delay(StartupDelay);

                ConfigurableContextBotConfig config = null;
                Type robotType = null;

                if (File != null)
                {
                    var fileName = Path.GetFullPath(File);
                    var text = System.IO.File.ReadAllText(fileName);
                    config = JsonConvert.DeserializeObject<ConfigurableContextBotConfig>(text);
                    if (config.RobotType != null)
                        robotType = Type.GetType(config.RobotType);
                }

                var tasks = new List<Task>();


                if (TypeName != null)
                    robotType = Type.GetType(TypeName);
                if (robotType == null)
                    if (config?.RobotType != null)
                        robotType = Type.GetType(config.RobotType);
                if (robotType == null)
                    robotType = typeof(ContextTurret);

                if (Name == null && config?.Name != null)
                    Name = config.Name;
                if (Name == null)
                    Name = "robot";

                if (Sprite == null && config?.Sprite != null)
                    Sprite = config.Sprite;
                if (Sprite == null)
                    Sprite = "ship_red";

                if (Color == null && config?.Color != null)
                    Color = config.Color;
                if (Color == null)
                    Color = "red";

                for (int i = 0; i < Replicas; i++)
                {
                    var connection = await API.Player.ConnectAsync(World);
                    var robot = Activator.CreateInstance(robotType) as Robot;
                    robot.AutoSpawn = true;
                    robot.AutoFire = Firing;
                    robot.Color = Color;
                    robot.Name = Name;
                    robot.Target = Target;
                    robot.Sprite = Sprite;

                    if (robot is ConfigurableContextBot configBot)
                        configBot.ConfigurationFileName = File;

                    tasks.Add(robot.StartAsync(connection));

                };

                await Task.WhenAll(tasks);

                foreach (var task in tasks)
                {
                    if (task.IsFaulted)
                        Console.WriteLine($"Robot Crashed: {task.Exception}");
                }
            }
        }
    }
}