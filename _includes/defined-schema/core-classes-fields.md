# Core Classes/Fields

Parse will never delete these fields on **ALL** classes if not provided in a class schema

- `objectId`
- `createdAt`
- `updatedAt`
- `ACL`

Parse Server will never delete the following fields from any class, even if these fields are not defined in a class schema.

- `_User`

  - `username`
  - `password`
  - `email`
  - `emailVerified`
  - `authData`

- `_Installation`

  - `installationId`
  - `deviceToken`
  - `channels`
  - `deviceType`
  - `pushType`
  - `GCMSenderId`
  - `timeZone`
  - `localeIdentifier`
  - `badge`
  - `appVersion`
  - `appName`
  - `appIdentifier`
  - `parseVersion`

- `_Role`

  - `name`
  - `users`
  - `roles`

- `_Session`

  - `user`
  - `installationId`
  - `sessionToken`
  - `expiresAt`
  - `createdWith`

- `_Product`

  - `productIdentifier`
  - `download`
  - `downloadName`
  - `icon`
  - `order`
  - `title`
  - `subtitle`

- `_PushStatus`

  - `pushTime`
  - `source`
  - `query`
  - `payload`
  - `title`
  - `expiry`
  - `expiration_interval`
  - `status`
  - `numSent`
  - `numFailed`
  - `pushHash`
  - `errorMessage`
  - `sentPerType`
  - `failedPerType`
  - `sentPerUTCOffset`
  - `failedPerUTCOffset`
  - `count`

- `_JobStatus`

  - `jobName`
  - `source`
  - `status`
  - `message`
  - `params`
  - `finishedAt`

- `_JobSchedule`

  - `jobName`
  - `description`
  - `params`
  - `startAfter`
  - `daysOfWeek`
  - `timeOfDay`
  - `lastRun`
  - `repeatMinutes`

- `_Audience`
  - `objectId`
  - `name`
  - `query`
  - `lastUsed`
  - `timesUsed`
- `_Idempotency`
  - `reqId`
  - `expire`
