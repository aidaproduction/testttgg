import { useRef } from 'react';
import Matter from 'matter-js';
import { GameObject } from '@/components/GameEngine';

interface PhysicsObject {
  id: string;
  x: number;
  y: number;
  body: Matter.Body;
}

export const usePhysics = () => {
  const engine = useRef<Matter.Engine | null>(null);
  const physicsObjects = useRef<PhysicsObject[]>([]);

  const reset = () => {
    if (engine.current) {
      Matter.World.clear(engine.current.world, false);
      Matter.Engine.clear(engine.current);
    }
    
    // Create new engine with tuned iterations for more stable collisions
    engine.current = Matter.Engine.create();
    engine.current.world.gravity.y = 1;
    engine.current.world.gravity.x = 0;
    // Improve collision robustness (reduces tunneling)
    (engine.current as any).velocityIterations = 8;
    (engine.current as any).positionIterations = 8;
    (engine.current as any).constraintIterations = 4;
    
    physicsObjects.current = [];
    
    // Static boundaries (large, off-screen)
    const ground = Matter.Bodies.rectangle(0, 400, 4000, 120, { 
      isStatic: true,
      friction: 1,
      restitution: 0,
      render: { fillStyle: 'transparent' }
    });
    const ceiling = Matter.Bodies.rectangle(0, -600, 4000, 120, { isStatic: true, render: { fillStyle: 'transparent' } });
    const leftWall = Matter.Bodies.rectangle(-1000, 0, 120, 3000, { isStatic: true, render: { fillStyle: 'transparent' } });
    const rightWall = Matter.Bodies.rectangle(1000, 0, 120, 3000, { isStatic: true, render: { fillStyle: 'transparent' } });
    Matter.World.add(engine.current.world, [ground, ceiling, leftWall, rightWall]);
  };

  const addPhysicsObject = (gameObject: GameObject, components: any[]) => {
    if (!engine.current) return;

    const rigidbody = components.find(c => c.type === 'rigidbody' && c.enabled);
    const collider = components.find(c => c.type === 'boxCollider' && c.enabled);

    if (rigidbody && collider) {
      // Create physics body
      const body = Matter.Bodies.rectangle(
        gameObject.x, 
        gameObject.y, 
        gameObject.width * (gameObject.scale?.x || 1), 
        gameObject.height * (gameObject.scale?.y || 1),
        {
          mass: rigidbody.properties?.mass || 1,
          frictionAir: rigidbody.properties?.drag ?? 0.01,
          restitution: 0.1,
          friction: 0.7,
          slop: 0.05,
          render: { fillStyle: 'transparent' }
        }
      );

      // Rigidbody type
      if (rigidbody.properties?.gravityScale !== undefined && rigidbody.properties.gravityScale === 0) {
        body.isStatic = true;
      }
      body.label = gameObject.id;
 
      Matter.World.add(engine.current.world, body);
      
      const physicsObject: PhysicsObject = {
        id: gameObject.id,
        x: gameObject.x,
        y: gameObject.y,
        body
      };
      
      physicsObjects.current.push(physicsObject);
    }
  };

  const step = () => {
    if (!engine.current) return physicsObjects.current;

    // Run physics engine
    Matter.Engine.update(engine.current, 16.67); // ~60fps

    // Update positions from physics bodies
    physicsObjects.current.forEach(obj => {
      if (obj.body) {
        obj.x = obj.body.position.x;
        obj.y = obj.body.position.y;
      }
    });

    return physicsObjects.current;
  };

  return {
    reset,
    addPhysicsObject,
    step
  };
};