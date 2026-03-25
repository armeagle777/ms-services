import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { buildAdminResources } from './admin.resources';

const dynamicImport = new Function('modulePath', 'return import(modulePath)') as (
   modulePath: string,
) => Promise<any>;

const adminJSImport: Promise<DynamicModule> = Promise.all([
   dynamicImport('@adminjs/nestjs'),
   dynamicImport('@adminjs/sequelize'),
   dynamicImport('adminjs'),
]).then(([{ AdminModule: AdminJSNestModule }, AdminJSSequelize, { default: AdminJS }]) => {
   AdminJS.registerAdapter({
      Database: AdminJSSequelize.Database,
      Resource: AdminJSSequelize.Resource,
   });

   return AdminJSNestModule.createAdminAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
         const adminEmail = configService.get<string>('ADMINJS_EMAIL', 'admin@example.com');
         const adminPassword = configService.get<string>('ADMINJS_PASSWORD', 'admin123');
         const cookieSecret = configService.get<string>(
            'ADMINJS_COOKIE_SECRET',
            'adminjs_cookie_secret_change_me',
         );
         const sessionSecret = configService.get<string>(
            'ADMINJS_SESSION_SECRET',
            'adminjs_session_secret_change_me',
         );

         return {
            adminJsOptions: {
               rootPath: '/admin',
               resources: buildAdminResources(),
               branding: {
                  companyName: 'MS Services RBAC',
               },
            },
            auth: {
               authenticate: async (email: string, password: string) => {
                  if (email === adminEmail && password === adminPassword) {
                     return { email };
                  }
                  return null;
               },
               cookieName: 'adminjs',
               cookiePassword: cookieSecret,
            },
            sessionOptions: {
               resave: false,
               saveUninitialized: false,
               secret: sessionSecret,
            },
         };
      },
   });
});

@Module({
   imports: [ConfigModule, adminJSImport],
})
export class AdminModule {}
