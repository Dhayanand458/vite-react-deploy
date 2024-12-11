import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

const CameraContext = createContext();

export const useCamera = () => useContext(CameraContext);

export const CameraProvider = ({ children }) => {
    const { camera, controls } = useThree();
    const cameraTarget = useRef(new Vector3());
    const [focusedObject, setFocusedObject] = useState(null);

    useEffect(() => {
        if (controls) {
            // Disable all camera controls to prevent interaction
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.enableRotate = false;
        }

        // Set the initial camera position and look direction
        camera.position.set(0, 3, 15); // Adjust these values as needed
        camera.lookAt(0, 0, 0); // Ensure the camera looks at the center of your scene
        camera.fov = 80; // Set field of view
        camera.updateProjectionMatrix(); // Update projection matrix to apply changes
    }, [controls, camera]);

    // Handle focus
    const handleFocus = (event) => {
        const object = event.object;
        const instanceId = event.instanceId;

        if (instanceId !== undefined) {
            setFocusedObject({ object, instanceId });
        } else {
            setFocusedObject({ object });
        }
    };

    return <CameraContext.Provider value={{ focusedObject, handleFocus }}>{children}</CameraContext.Provider>;
};
