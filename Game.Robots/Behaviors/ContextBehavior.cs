﻿using System.Numerics;

namespace Game.Robots.Behaviors
{
    public class ContextBehavior : IBehaviors
    {
        public virtual float BehaviorWeight { get; set; } = 1f;
        protected readonly ContextRobot Robot;
        public int LookAheadMS { get; set; } = 100;
        private long SleepUntil = 0;
        private ContextRing LastRing = null;
        public int Cycle = 0;

        public ContextBehavior(ContextRobot robot)
        {
            this.Robot = robot;
        }

        public ContextRing Behave(int steps)
        {
            if (this.Robot.GameTime > SleepUntil)
            {
                var ring = new ContextRing(steps);
                this.PreSweep(ring);

                if (Robot?.SensorFleets?.MyFleet?.Ships != null)
                {
                    for (var i = 0; i < steps; i++)
                    {
                        var momentum = Robot.SensorFleets.MyFleet.Momentum;
                        var position = RoboMath.ShipThrustProjection(Robot.HookComputer,
                            Robot.Position,
                            ref momentum,
                            Robot.SensorFleets.MyFleet.Ships.Count,
                            ring.Angle(i),
                            LookAheadMS
                        );

                        ring.Weights[i] = ScoreAngle(ring.Angle(i), position, momentum);
                    }
                }

                ring.RingWeight = BehaviorWeight;

                this.PostSweep(ring);

                ring.Name = this.GetType().Name;
                LastRing = ring;

                if (Cycle > 0)
                    Sleep(Cycle);

                return ring;
            }
            else
                return LastRing;
        }

        protected void Sleep(int ms)
        {
            SleepUntil = this.Robot.GameTime + ms;
        }

        public virtual void Reset()
        {
        }

        protected virtual void PreSweep(ContextRing ring)
        {
        }

        protected virtual void PostSweep(ContextRing ring)
        {
        }

        protected virtual float ScoreAngle(float angle, Vector2 position, Vector2 momentum) => 0f;
    }
}
