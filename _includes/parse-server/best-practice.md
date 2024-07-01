# Best Practice

*This page is a work in progress and incomplete. If you have any suggestions, please open a pull request.*

## Security

### Firewall

Protect all Parse Server endpoints using a Firewall to mitigate the risk of malicious attempts to scape user data, flood the database and DDoS attacks.
- Use rate-limiting rules for public endpoints, for example limit the number of requests per IP address or per user.
- Use very restrictive rules for private endpoints; for example limit access to Parse Dashboard to your personal network.

## Optimization

The following is a list of design considerations to optimize data traffic and performance.

### Database

- Use short field names; field names need to be stored in the database just like the field values; short field names not only require less database storage but also reduce the data traffic between database, server and client.

### Queries

- Use `select` and `exclude` to transfer only the fields that you need instead of the whole object.