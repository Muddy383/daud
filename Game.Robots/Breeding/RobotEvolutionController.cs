﻿namespace Game.Robots.Breeding
{
    using GeneticSharp.Domain;
    using GeneticSharp.Domain.Crossovers;
    using GeneticSharp.Domain.Mutations;
    using GeneticSharp.Domain.Populations;
    using GeneticSharp.Domain.Selections;
    using GeneticSharp.Infrastructure.Framework.Threading;
    using System;
    using System.Threading.Tasks;

    public class RobotEvolutionController
    {
        private int NumberOfSimultaneousEvaluations = 1;

		public GeneticAlgorithm CreateGA(Func<RobotChromosome, Task<ConfigurableContextBot>> botFactory, RobotEvolutionConfiguration config)
        {
            NumberOfSimultaneousEvaluations = 2;
            var fitness = new RobotFitness(botFactory, config);
            var chromosome = new RobotChromosome(config);      
            var crossover = new UniformCrossover();
            var mutation = new FlipBitMutation();
            var selection = new EliteSelection();
            var population = new Population(NumberOfSimultaneousEvaluations, NumberOfSimultaneousEvaluations, chromosome)
            {
                GenerationStrategy = new PerformanceGenerationStrategy()
            };

            var ga = new GeneticAlgorithm(population, fitness, selection, crossover, mutation)
            {
                Termination = new RobotTermination(),
                TaskExecutor = new ParallelTaskExecutor
                {
                    MinThreads = population.MinSize,
                    MaxThreads = population.MaxSize * 2
                }
            };
            ga.GenerationRan += delegate
            {
                Console.WriteLine("Generation complete");
            };

            ga.MutationProbability = .1f;

            return ga;
        }
    }
}