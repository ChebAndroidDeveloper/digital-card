import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { queryBudget } from './common/query-budget';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { formatGraphQLError } from './common/format-graphql-error';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    PrismaModule,
    ProfileModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      validationRules: [queryBudget],
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault() as any],
      introspection: true,
      formatError: formatGraphQLError,
    }),
  ],
})
export class AppModule {}
