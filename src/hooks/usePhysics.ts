import { useCallback, useRef } from 'react';
import { GameObject, GameComponent } from '@/components/GameEngine';

interface PhysicsObject extends GameObject {
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  mass: number;
  friction: number;
  bounciness: number;
  isStatic: boolean;
}

interface CollisionResult {
  isColliding: boolean;
  penetration?: { x: number; y: number };
  normal?: { x: number; y: number };
}

export const usePhysics = () => {
  const physicsObjects = useRef<Map<string, PhysicsObject>>(new Map());
  const lastTime = useRef<number>(Date.now());

  // Optimized AABB collision detection
  const checkCollision = useCallback((obj1: PhysicsObject, obj2: PhysicsObject): CollisionResult => {
    const left1 = obj1.x;
    const right1 = obj1.x + obj1.width * (obj1.scale?.x || 1);
    const top1 = obj1.y;
    const bottom1 = obj1.y + obj1.height * (obj1.scale?.y || 1);

    const left2 = obj2.x;
    const right2 = obj2.x + obj2.width * (obj2.scale?.x || 1);
    const top2 = obj2.y;
    const bottom2 = obj2.y + obj2.height * (obj2.scale?.y || 1);

    const isColliding = !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2);

    if (!isColliding) {
      return { isColliding: false };
    }

    // Calculate penetration and normal for collision resolution
    const overlapX = Math.min(right1 - left2, right2 - left1);
    const overlapY = Math.min(bottom1 - top2, bottom2 - top1);

    let normal = { x: 0, y: 0 };
    let penetration = { x: 0, y: 0 };

    if (overlapX < overlapY) {
      normal.x = left1 < left2 ? -1 : 1;
      penetration.x = overlapX * normal.x;
    } else {
      normal.y = top1 < top2 ? -1 : 1;
      penetration.y = overlapY * normal.y;
    }

    return { isColliding: true, penetration, normal };
  }, []);

  // Resolve collision with impulse-based method (optimized for mobile)
  const resolveCollision = useCallback((obj1: PhysicsObject, obj2: PhysicsObject, collision: CollisionResult) => {
    if (!collision.penetration || !collision.normal) return;

    const { penetration, normal } = collision;

    // Separate objects
    if (!obj1.isStatic && !obj2.isStatic) {
      obj1.x -= penetration.x * 0.5;
      obj1.y -= penetration.y * 0.5;
      obj2.x += penetration.x * 0.5;
      obj2.y += penetration.y * 0.5;
    } else if (!obj1.isStatic) {
      obj1.x -= penetration.x;
      obj1.y -= penetration.y;
    } else if (!obj2.isStatic) {
      obj2.x += penetration.x;
      obj2.y += penetration.y;
    }

    // Calculate relative velocity
    const relativeVelocity = {
      x: obj1.velocity.x - obj2.velocity.x,
      y: obj1.velocity.y - obj2.velocity.y
    };

    // Relative velocity along normal
    const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

    // Don't resolve if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Calculate restitution (bounciness)
    const restitution = Math.min(obj1.bounciness, obj2.bounciness);

    // Calculate impulse scalar
    let impulseScalar = -(1 + restitution) * velocityAlongNormal;
    impulseScalar /= (1 / obj1.mass) + (1 / obj2.mass);

    // Apply impulse
    const impulse = {
      x: impulseScalar * normal.x,
      y: impulseScalar * normal.y
    };

    if (!obj1.isStatic) {
      obj1.velocity.x += impulse.x / obj1.mass;
      obj1.velocity.y += impulse.y / obj1.mass;
    }

    if (!obj2.isStatic) {
      obj2.velocity.x -= impulse.x / obj2.mass;
      obj2.velocity.y -= impulse.y / obj2.mass;
    }
  }, []);

  const addPhysicsObject = useCallback((object: GameObject, components: GameComponent[]) => {
    const hasRigidbody = components.some(c => c.type === 'rigidbody' && c.enabled);
    
    if (hasRigidbody) {
      const physicsObj: PhysicsObject = {
        ...object,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 200 }, // gravity
        mass: 1,
        friction: 0.8,
        bounciness: 0.3,
        isStatic: false
      };
      
      physicsObjects.current.set(object.id, physicsObj);
    }
  }, []);

  const removePhysicsObject = useCallback((objectId: string) => {
    physicsObjects.current.delete(objectId);
  }, []);

  const updatePhysics = useCallback((deltaTime: number) => {
    const objects = Array.from(physicsObjects.current.values());
    
    // Update positions and velocities
    for (const obj of objects) {
      if (obj.isStatic) continue;

      // Apply acceleration (gravity, forces)
      obj.velocity.x += obj.acceleration.x * deltaTime;
      obj.velocity.y += obj.acceleration.y * deltaTime;

      // Apply friction
      obj.velocity.x *= Math.pow(obj.friction, deltaTime);
      obj.velocity.y *= Math.pow(obj.friction, deltaTime);

      // Update position
      obj.x += obj.velocity.x * deltaTime;
      obj.y += obj.velocity.y * deltaTime;

      // Screen bounds (simple boundary)
      if (obj.x < 0) {
        obj.x = 0;
        obj.velocity.x = Math.abs(obj.velocity.x) * obj.bounciness;
      }
      if (obj.y < 0) {
        obj.y = 0;
        obj.velocity.y = Math.abs(obj.velocity.y) * obj.bounciness;
      }
    }

    // Check collisions between all objects with box colliders
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const collision = checkCollision(objects[i], objects[j]);
        if (collision.isColliding) {
          resolveCollision(objects[i], objects[j], collision);
        }
      }
    }

    return objects;
  }, [checkCollision, resolveCollision]);

  const step = useCallback(() => {
    const currentTime = Date.now();
    const deltaTime = Math.min((currentTime - lastTime.current) / 1000, 1/30); // Cap at 30fps minimum
    lastTime.current = currentTime;

    return updatePhysics(deltaTime);
  }, [updatePhysics]);

  const reset = useCallback(() => {
    physicsObjects.current.clear();
    lastTime.current = Date.now();
  }, []);

  return {
    addPhysicsObject,
    removePhysicsObject,
    step,
    reset,
    getPhysicsObjects: () => Array.from(physicsObjects.current.values())
  };
};