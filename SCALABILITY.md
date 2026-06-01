# Scalability Roadmap

This document outlines how the Task Management System can scale from a monolith to a globally distributed system.

## 1. Redis Caching

**Problem**: Repeated database queries for frequently accessed data (user profiles, task lists) cause unnecessary load.

**Solution**:
- Cache user sessions and profiles in Redis
- Cache paginated task lists with TTL-based invalidation
- Use cache-aside pattern: check Redis first, fall back to DB, update cache
- Invalidate cache on writes using key-based patterns (`user:{id}`, `tasks:user:{id}:page:{n}`)

```typescript
// Example caching layer
const getCached = async (key: string, fetchFn: () => Promise<any>, ttl = 300) => {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
};