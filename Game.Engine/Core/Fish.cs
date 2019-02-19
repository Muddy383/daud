﻿namespace Game.Engine.Core
{
    using Game.API.Common;
    using Game.Engine.Core.Steering;
    using System;
    using System.Linq;
    using System.Numerics;

    public class Fish : Ship
    {
        private long SleepUntil = 0;
        private int SleepTime = 500;

        public Fish()
        {
            Size = 10;
            Sprite = Sprites.fish;
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
            ThrustAmount = World.Hook.FishThrust;
        }

        public override void Think()
        {
            if (SleepUntil < World.Time)
            {
                base.Think();
                Flock();
                SleepUntil = World.Time + SleepTime;
            }
        }

        private void Flock()
        {
            var oobVectorWeight = 0.2f;
            var ships = World.BodiesNear(Position, World.Hook.FlockCohesionMaximumDistance)
                .OfType<Ship>();

            var flockingVector = Vector2.Zero;
            var oobVector = Vector2.Zero;

            if (ships.Count() > 1)
                flockingVector =
                    (World.Hook.FlockCohesion
                        * Flocking.Cohesion(ships, this, World.Hook.FlockCohesionMaximumDistance))
                    + (World.Hook.FlockAlignment
                        * Flocking.Alignment(ships, this))
                    + (World.Hook.FlockSeparation
                        * Flocking.Separation(ships, this, World.Hook.FlockSeparationMinimumDistance));

            if (IsOOB)
            {
                if (Position != Vector2.Zero)
                    oobVector = Vector2.Normalize(-Position) * oobVectorWeight;
            }

            var steeringVector =
                new Vector2(MathF.Cos(Angle), MathF.Sin(Angle))
                + World.Hook.FlockWeight * flockingVector
                + oobVector;

            Angle = MathF.Atan2(steeringVector.Y, steeringVector.X);
        }
    }
}
