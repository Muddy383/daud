﻿namespace Game.Engine.Core
{
    using Game.API.Common;
    using Game.Engine.Networking;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http;

    public class Player : IActor
    {
        private static readonly HttpClient HttpClient = new HttpClient();

        public World World = null;
        public Fleet Fleet = null;

        public Connection Connection { get; set; }

        public static Dictionary<World, List<Player>> Players = new Dictionary<World, List<Player>>();

        public int Score { get; set; }

        public ControlInput ControlInput { get; set; }
        private bool IsControlNew = false;

        public List<string> Messages { get; set; } = new List<string>();

        public bool IsAlive { get; set; } = false;
        public bool IsStillPlaying {get;set;} = false;
        public long DeadSince { get; set; } = 0;

        public bool IsInvulnerable { get; set; } = false;

        public long SpawnTime;
        public const int InvulnerableTime = 2000;

        public Sprites ShipSprite { get; set; }
        public string Color { get; set; }
        public string Token { get; set; }
        public bool PendingDestruction { get; set; } = false;
        private bool IsSpawning = false;

        public string IP { get; set; } = null;

        public void SetControl(ControlInput input)
        {
            this.ControlInput = input;
            this.IsControlNew = true;
        }

        public virtual void CreateDestroy()
        {
            if (IsSpawning && !IsAlive && Fleet == null)
            {
                IsSpawning = false;

                IsAlive = true;

                Fleet = CreateFleet(Color);

                Fleet.Init(World);

                IsInvulnerable = true;
                SpawnTime = World.Time;
            }

            if (PendingDestruction)
            {
                Destroy();
                PendingDestruction = false;
            }

            IsStillPlaying = !PendingDestruction && 
                DeadSince > World.Time - World.Hook.PlayerCountGracePeriodMS;
        }

        public void Destroy()
        {
            Die();

            if (Fleet != null)
            {
                Fleet.Destroy();
                Fleet = null;
            }

            World.Actors.Remove(this);

            var worldPlayers = GetWorldPlayers(World);
            worldPlayers.Remove(this);
        }

        public void Init(World world)
        {
            World = world;
            world.Actors.Add(this);

            var worldPlayers = GetWorldPlayers(world);
            worldPlayers.Add(this);

        }

        public string Name { get; set; }

        public static List<Player> GetTeam(World world, string color)
        {
            return Player.GetWorldPlayers(world)
                .Where(p => p.IsAlive)
                .Where(p => p.Color == color)
                .ToList();
        }

        public static List<Player> GetWorldPlayers(World world)
        {
            lock (typeof(Player))
            {
                List<Player> worldPlayers = null;
                if (!Players.ContainsKey(world))
                {
                    worldPlayers = new List<Player>();
                    Players.Add(world, worldPlayers);
                }
                else
                    worldPlayers = Players[world];

                return worldPlayers;
            }
        }

        public virtual void Think()
        {
            if (!IsAlive)
                return;

            if (this.IsControlNew)
            {
                if (float.IsNaN(ControlInput.Position.X))
                    ControlInput.Position = new System.Numerics.Vector2(0, 0);

                Fleet.AimTarget = ControlInput.Position;
                Fleet.BoostRequested = ControlInput.BoostRequested;
                Fleet.ShootRequested = ControlInput.ShootRequested;
                Fleet.CustomData = ControlInput.CustomData;
            }

            this.IsControlNew = false;

            if (IsInvulnerable)
            {
                if (this.ControlInput?.ShootRequested ?? false)
                    IsInvulnerable = false;

                if (World.Time > SpawnTime + InvulnerableTime)
                    IsInvulnerable = false;
            }
        }

        protected virtual Fleet CreateFleet(string color)
        {
            if (World.NewFleetGenerator != null)
                return World.NewFleetGenerator(this, color);
            else
                return new Fleet
                {
                    Owner = this,
                    Caption = this.Name,
                    Color = color
                };
        }

        public void Spawn(string name, Sprites sprite, string color, string token)
        {
            // sanitize the name
            if (name != null
                && name.Length > 15)
                name = name.Substring(0, 15);

            Name = name;


            ShipSprite = sprite;

            Color = color;

            Token = token;

            IsSpawning = true;

        }

        protected virtual void OnDeath(Player player = null)
        {
            Score = (int)Math.Max(Score * World.Hook.PointsMultiplierDeath, 0);

            if (!string.IsNullOrEmpty(this.Token) && !string.IsNullOrEmpty(player?.Token))
                RemoteEventLog.SendEvent(new
                {
                    token = this.Token,
                    name = this.Name,
                    killedBy = player?.Token
                });
        }

        public void Exit()
        {
            if (IsAlive)
            {
                DeadSince = World.Time;
                OnDeath();

                if (Fleet != null)
                {
                    Fleet.Abandon();

                    Fleet.Ships.Clear();
                    Fleet.PendingDestruction = true;
                }

                Fleet = null;
                IsAlive = false;
            }

        }

        public void Die(Player player = null)
        {
            if (IsAlive)
            {
                DeadSince = World.Time;
                OnDeath(player);

                if (Fleet != null)
                    Fleet.PendingDestruction = true;

                Fleet = null;
                IsAlive = false;
            }
        }

        public void SendMessage(string message)
        {
            this.Messages.Add(message);
        }

        public List<string> GetMessages()
        {
            if (Messages.Count > 0)
            {
                var m = Messages;
                Messages = new List<string>();
                return m;
            }
            else
                return null;
        }
    }
}
