﻿namespace Game.Engine.Core.Weapons
{
    using Game.Engine.Core.Maps;
    using System;
    using System.Linq;
    using System.Numerics;

    public class ShipWeaponBullet : ActorBody, IShipWeapon
    {
        public Fleet OwnedByFleet { get; set; }
        public long TimeDeath { get; set; }
        public long TimeBirth { get; set; }

        public float ThrustAmount { get; set; }

        public float Drag { get => World.Hook.Drag; }

        public bool Consumed { get; set; }

        public ShipWeaponBullet()
        {
            CausesCollisions = true;
        }

        public override void Think()
        {
            base.Think();

            var thrust = new Vector2(MathF.Cos(Angle), MathF.Sin(Angle)) * ThrustAmount * 10;
            Momentum = thrust;

            if (World.Time >= TimeDeath)
                PendingDestruction = true;
        }

        protected override void Collided(ICollide otherObject)
        {
            TimeDeath = World.Time;
        }

        public virtual void FireFrom(Ship ship, ActorGroup group)
        {
            World = ship.World;
            var bulletOrigin = ship.Position
                + new Vector2(MathF.Cos(ship.Angle), MathF.Sin(ship.Angle)) * ship.Size;

            var momentum =
                new Vector2(MathF.Cos(ship.Angle), MathF.Sin(ship.Angle)) 
                * Vector2.Distance(ship.Momentum, Vector2.Zero);


            this.TimeDeath = World.Time + (long)(World.Hook.BulletLife);
            this.Momentum = momentum;
            this.Position = bulletOrigin;

            if (World.Hook.PrecisionBullets && ship.Fleet != null)
            {
                var toTarget = (ship.Fleet.FleetCenter + ship.Fleet.AimTarget) - ship.Position;
                this.Angle = MathF.Atan2(toTarget.Y, toTarget.X);
            }
            else
                this.Angle = ship.Angle;

            this.OwnedByFleet = ship.Fleet;
            this.Sprite = ship.Fleet.BulletSprite;
            this.Size = 20;
            this.Color = ship.Color;
            this.ThrustAmount = ship.Fleet.Ships.Count() * ship.Fleet.ShotThrustM + ship.Fleet.ShotThrustB;
            this.TimeBirth = World.Time;
            this.Group = group;
        }

        public virtual void FireFrom(Tile tile, float angle)
        {
            World = tile.World;

            this.TimeDeath = World.Time + (long)(World.Hook.BulletLife);
            this.Position = tile.Position;
            this.Angle = angle;
            this.Sprite = API.Common.Sprites.bullet;
            this.Size = 20;
            this.Color = "green";
            this.ThrustAmount = 1 * World.Hook.ShotThrustM + World.Hook.ShotThrustB;
            this.TimeBirth = World.Time;
        }

        public bool Active => this.Exists;
    }
}
