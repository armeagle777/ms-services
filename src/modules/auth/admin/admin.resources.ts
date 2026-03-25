import { ActionRequest, ResourceWithOptions } from 'adminjs';
import * as bcrypt from 'bcrypt';
import { APIClient } from 'src/modules/auth/entities/api-client.model';
import { APIClientPermission } from 'src/modules/auth/entities/api-client-permission.model';
import { Permission } from 'src/modules/auth/entities/permission.model';

const SALT_ROUNDS = 12;

const hashClientPassword = async (request: ActionRequest): Promise<ActionRequest> => {
   if (!request.payload) return request;

   const payload = { ...request.payload };
   const password = typeof payload.password === 'string' ? payload.password.trim() : '';

   if (password) {
      payload.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
   }

   delete payload.password;
   request.payload = payload;
   return request;
};

export const buildAdminResources = (): ResourceWithOptions[] => {
   return [
      {
         resource: APIClient,
         options: {
            navigation: { name: 'RBAC', icon: 'User' },
            properties: {
               password: {
                  type: 'password',
                  isVisible: { list: false, filter: false, show: false, edit: true },
               },
               passwordHash: {
                  isVisible: { list: false, filter: false, show: false, edit: false },
               },
               createdAt: { isVisible: { edit: false, show: true, list: true, filter: true } },
            },
            actions: {
               new: { before: hashClientPassword },
               edit: { before: hashClientPassword },
               show: { isAccessible: true },
               delete: { isAccessible: true },
            },
            listProperties: ['id', 'name', 'username', 'isActive', 'createdAt'],
            editProperties: ['name', 'username', 'password', 'isActive'],
            showProperties: ['id', 'name', 'username', 'isActive', 'createdAt'],
            filterProperties: ['id', 'name', 'username', 'isActive', 'createdAt'],
         },
      },
      {
         resource: Permission,
         options: {
            navigation: { name: 'RBAC', icon: 'Shield' },
            listProperties: ['id', 'name', 'description', 'createdAt'],
            editProperties: ['name', 'description'],
            showProperties: ['id', 'name', 'description', 'createdAt'],
         },
      },
      {
         resource: APIClientPermission,
         options: {
            navigation: { name: 'RBAC', icon: 'Link' },
            listProperties: ['id', 'clientId', 'permissionId', 'createdAt'],
            editProperties: ['clientId', 'permissionId'],
            showProperties: ['id', 'clientId', 'permissionId', 'createdAt'],
         },
      },
   ];
};
