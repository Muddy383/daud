﻿namespace Game.Engine.Controllers
{
    using Game.API.Common.Models;
    using Game.API.Common.Security;
    using Game.Engine.Core;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Cors;
    using Microsoft.AspNetCore.Mvc;
    using Newtonsoft.Json;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    public class ServerController : APIControllerBase
    {
        public ServerController(ISecurityContext securityContext)
             : base(securityContext)
        {
        }

        [HttpGet, AllowAnonymous]
        public Server Get()
        {
            var world = Worlds.Find();

            return new Server
            {
                PlayerCount = Player.GetWorldPlayers(world).Count,
                WorldCount = 1
            };
        }

        [HttpPost, Route("reset")]
        public bool Reset()
        {
            Program.Abort();

            return true;
        }

        [HttpPost, Route("announce")]
        public bool Announce(string message, string worldName = null)
        {
            var world = Worlds.Find(worldName);
            var players = Player.GetWorldPlayers(world);
            foreach (var player in players)
                player.SendMessage(message);

            return true;
        }

        [HttpPost, Route("hook")]
        public async Task<string> Hook(string worldName = null)
        {
            string json = null;

            using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
                json = await reader.ReadToEndAsync();

            var world = Worlds.Find(worldName);

            JsonConvert.PopulateObject(json, world.Hook);
            
            // connection is using getHashCode for change detection
            world.Hook = world.Hook.Clone();

            return JsonConvert.SerializeObject(world.Hook, Formatting.Indented);
        }

        [HttpGet, Route("players")]
        public IEnumerable<GameConnection> GetPlayers(string worldName = null)
        {
            var world = Worlds.Find(worldName);
            return Player.GetWorldPlayers(world)
                .Select(p => new GameConnection
                {
                    Name = p.Name,
                    Score = p.Score,
                    IsAlive = p.IsAlive,
                    IP = p.IP,
                    Backgrounded = p.Connection?.Backgrounded ?? false,
                    ClientFPS = p.Connection?.ClientFPS ?? 0,
                    ClientVPS = p.Connection?.ClientVPS ?? 0,
                    ClientUPS = p.Connection?.ClientUPS ?? 0,
                    ClientCS = p.Connection?.ClientCS ?? 0,
                    Bandwidth = p.Connection?.Bandwidth ?? 0,
                    Latency = p.Connection?.Latency ?? 0
                });
        }
    }
}
