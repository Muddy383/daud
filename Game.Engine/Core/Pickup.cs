﻿namespace Game.Engine.Core
{
    using Game.API.Common;
    using System;
    using System.Numerics;

    public class Pickup : ActorBody, ICollide
    {
        public Sprites BulletSprite { get; set; }

        public Pickup()
        {
            Size = 100;
            Sprite = Sprites.seeker_pickup;
            BulletSprite = Sprites.seeker;
            Color = "rgba(128,128,128,.2)";
        }

        public override void Init(World world)
        {
            World = world;
            Randomize();
            base.Init(world);
        }

        public void Randomize()
        {
            var r = new Random();
            Position = World.RandomPosition();
            Momentum = new Vector2(
                (float)(r.NextDouble() * 2 * World.Hook.ObstacleMaxMomentum - World.Hook.ObstacleMaxMomentum),
                (float)(r.NextDouble() * 2 * World.Hook.ObstacleMaxMomentum - World.Hook.ObstacleMaxMomentum)
            );
        }

        public void CollisionExecute(Body projectedBody)
        {
            var ship = projectedBody as Ship;
            var fleet = ship.Fleet;

            if (fleet != null)
            {
                // powerup the fleet
                fleet.AcceptPickup(this);
                Randomize();
            }
        }

        public bool IsCollision(Body projectedBody)
        {
            if (projectedBody is Ship ship)
            {
                if (ship.Abandoned)
                    return false;

                return Vector2.Distance(projectedBody.Position, this.Position)
                    < (projectedBody.Size + this.Size);
            }
            return false;
        }

        public override void Think()
        {
            base.Think();

            AngularVelocity = 0.005f;

            if (World.DistanceOutOfBounds(Position) > 0)
            {
                var speed = Momentum.Length();
                if (Position != Vector2.Zero)
                    Momentum = Vector2.Normalize(Vector2.Zero - Position) * speed;
            }
        }
    }
}
