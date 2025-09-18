import { useRef } from 'react';
import { GameObject } from '@/components/GameEngine';

interface PhysicsObject {
  id: string;
  x: number;
  y: number;
  body: any;
}

export const usePhysics = () => {
  const worldRef = useRef<any>(null);
  const physicsObjects = useRef<PhysicsObject[]>([]);
  const rapierRef = useRef<any>(null);

  const initRapier = async () => {
    if (!rapierRef.current) {
      const RAPIER = await import('@dimforge/rapier2d');
      rapierRef.current = RAPIER;
    }
    return rapierRef.current;
  };

  const reset = async () => {
    const RAPIER = await initRapier();
    
    if (worldRef.current) {
      worldRef.current.free();
    }
    
    // Create physics world with proper gravity (slower, more realistic)
    const gravity = new RAPIER.Vector2(0.0, 300.0); // Much slower gravity
    worldRef.current = new RAPIER.World(gravity);
    
    physicsObjects.current = [];
    
    // Create static boundaries
    const groundCollider = RAPIER.ColliderDesc.cuboid(2000, 60)
      .setTranslation(0, 400)
      .setFriction(0.8)
      .setRestitution(0.1);
    worldRef.current.createCollider(groundCollider);
    
    const ceilingCollider = RAPIER.ColliderDesc.cuboid(2000, 60)
      .setTranslation(0, -600);
    worldRef.current.createCollider(ceilingCollider);
    
    const leftWallCollider = RAPIER.ColliderDesc.cuboid(60, 1500)
      .setTranslation(-1000, 0);
    worldRef.current.createCollider(leftWallCollider);
    
    const rightWallCollider = RAPIER.ColliderDesc.cuboid(60, 1500)
      .setTranslation(1000, 0);
    worldRef.current.createCollider(rightWallCollider);
  };

  const addPhysicsObject = async (gameObject: GameObject, components: any[]) => {
    if (!worldRef.current) return;

    const RAPIER = await initRapier();
    const rigidbody = components.find(c => c.type === 'rigidbody' && c.enabled);
    const collider = components.find(c => c.type === 'boxCollider' && c.enabled);

    if (rigidbody || collider) {
      const width = gameObject.width * (gameObject.scale?.x || 1);
      const height = gameObject.height * (gameObject.scale?.y || 1);
      
      let rigidBodyDesc;
      
      if (rigidbody) {
        // Create dynamic rigidbody if rigidbody component exists
        if (rigidbody.properties?.gravityScale === 0) {
          rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
        } else {
          rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
        }
      } else {
        // Static body if only collider
        rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
      }
      
      rigidBodyDesc.setTranslation(gameObject.x, gameObject.y);
      const body = worldRef.current.createRigidBody(rigidBodyDesc);
      
      // Create collider
      const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2)
        .setFriction(0.8)
        .setRestitution(0.2)
        .setDensity(rigidbody?.properties?.mass || 1);
      
      worldRef.current.createCollider(colliderDesc, body);
      
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
    if (!worldRef.current) return physicsObjects.current;

    // Step physics world (60fps with proper timestep)
    worldRef.current.step();

    // Update positions from physics bodies
    physicsObjects.current.forEach(obj => {
      if (obj.body) {
        const translation = obj.body.translation();
        obj.x = translation.x;
        obj.y = translation.y;
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