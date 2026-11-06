import { Controller, Get, Module, Redirect, ServiceUnavailableException } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { DatabaseModule, DatabaseService } from './database/database.module.js';
import { ProfileModule } from './profile/profile.module.js';

@Controller()
class HealthController {
  constructor(private readonly db: DatabaseService) {}
  @Get() @Redirect('/graphql', 302) index() {}
  @Get('health')
  async health() {
    try {
      await this.db.client.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
@Module({
  imports: [
    DatabaseModule,
    ProfileModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      introspection: true,
      playground: false,
      includeStacktraceInErrorResponses: false,
      parseOptions: { maxTokens: 2000 },
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
