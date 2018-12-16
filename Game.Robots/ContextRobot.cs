﻿namespace Game.Robots
{
    using Game.Robots.Senses;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Numerics;
    using System.Threading.Tasks;

    public class ContextRobot : Robot
    {
        private List<ISense> Sensors = new List<ISense>();
        private readonly SensorBullets SensorBullets;
        private readonly SensorFleets SensorFleets;

        public ContextRobot()
        {
            Sensors.Add(SensorBullets = new SensorBullets(this));
            Sensors.Add(SensorFleets = new SensorFleets(this));
        }

        private void Sense()
        {
            foreach (var sensor in Sensors)
                sensor.Sense();
        }

        protected override Task AliveAsync()
        {
            Sense();

            SteerPointAbsolute(Vector2.Zero); // center of the universe

            var vel = Vector2.Zero;
            var fleets = false;
            if (SensorFleets.VisibleFleets.Any())
            {
                var fleet = SensorFleets.VisibleFleets.FirstOrDefault(f => f.ID != FleetID);
                if (fleet != null)
                {
                    fleets = true;
                    vel += (fleet.Center - Position) * 1;
                }
            }
            if (!fleets)
            {
                var angle = (float)((GameTime - SpawnTime) / 3000.0f) * MathF.PI * 2;
                vel.X += (float)Math.Cos(angle);
                vel.Y += (float)Math.Sin(angle);
            }

            var bullets = SensorBullets.VisibleBullets;
            var danger = false;

            if (bullets.Any())
            {
                var bullet = bullets.First();
                var distance = Vector2.Distance(bullet.Position, Position);
                if (distance < 2000)
                {
                    var avoid = (Position - bullet.Position);
                    vel += avoid * 400_000 / avoid.LengthSquared();
                }
                if (distance < 200)
                {
                    danger = true;
                }
            }

            SetSplit(danger);

            SteerAngle(MathF.Atan2(vel.Y, vel.X));

            // if you're not actually doing any async/await, just return this
            return Task.FromResult(0);
        }

        protected override Task DeadAsync()
        {
            return base.DeadAsync();
        }
    }
}
