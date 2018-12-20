﻿namespace Game.Robots
{
    using Game.API.Client;
    using System;
    using System.Collections.Generic;
    using System.Numerics;
    using System.Threading.Tasks;

    public class Robot
    {
        private Connection Connection;

        public string Name { get; set; } = "Robot";
        public string Sprite { get; set; } = "ship0";
        public string Color { get; set; } = "ship0";

        private bool IsAlive = false;
        public bool AutoSpawn { get; set; } = true;
        private const int RESPAWN_FALLOFF = 1000;
        private DateTime LastSpawn = DateTime.MinValue;

        protected long SpawnTime { get; private set; }
        protected long DeathTime { get; private set; }

        public bool AutoFire { get; set; } = false;

        public IEnumerable<Body> Bodies { get => Connection.Bodies; }
        public Vector2 Position { get => this.Connection.Position; }
        public long GameTime { get => this.Connection.GameTime; }
        public uint FleetID { get => this.Connection.FleetID; }

        protected virtual Task AliveAsync() => Task.FromResult(0);
        protected virtual Task DeadAsync() => Task.FromResult(0);
        protected virtual Task OnDeathAsync() => Task.FromResult(0);
        protected virtual Task OnSpawnAsync() => Task.FromResult(0);

        public async Task Start(Connection connection)
        {
            this.Connection = connection;
            this.Connection.OnView = OnView;
            await this.Connection.ListenAsync();
        }

        private async Task OnView()
        {
            if (IsAlive && !Connection.IsAlive)
            {
                this.SpawnTime = Connection.GameTime;
                await OnDeathAsync();
            }
            if (!IsAlive && Connection.IsAlive)
            {
                await OnSpawnAsync();
            }

            IsAlive = Connection.IsAlive;

            if (!Connection.IsAlive)
                await StepDeadAsync();
            else
                await StepAliveAsync();
        }

        protected void SteerAngle(float angle)
        {
            this.Connection.ControlAimTarget = new Vector2(MathF.Cos(angle), MathF.Sin(angle)) * 800;
        }

        protected void SteerPointAbsolute(Vector2 point)
        {
            var relative = point - this.Position;
            this.Connection.ControlAimTarget = relative;
        }

        protected void SteerPointRelative(Vector2 point)
        {
            this.Connection.ControlAimTarget = point;
        }

        protected void SetSplit(bool splitting)
        {
            this.Connection.ControlIsBoosting = splitting;
        }

        private async Task StepAliveAsync()
        {
            await AliveAsync();

            if (AutoFire)
            {
                this.Connection.ControlIsShooting = true;
            }

            await this.Connection.SendControlInputAsync();
        }

        private async Task StepDeadAsync()
        {
            await DeadAsync();

            if (AutoSpawn)
            {
                if (DateTime.Now.Subtract(LastSpawn).TotalMilliseconds > RESPAWN_FALLOFF)
                {
                    await Connection.SpawnAsync(Name, Sprite, Color);
                    LastSpawn = DateTime.Now;
                }
            }
        }

        public Vector2 VectorToAbsolutePoint(Vector2 absolutePoint)
        {
            return absolutePoint - this.Position;
        }
    }
}
