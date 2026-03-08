import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';

let GLView, Renderer, THREE, Asset, GLTFLoader;

// Lazy load 3D dependencies
const load3DLibraries = async () => {
    try {
        const { GLView: GLViewModule } = require('expo-gl');
        const { Renderer: RendererModule } = require('expo-three');
        const THREEModule = require('three');
        const { Asset: AssetModule } = require('expo-asset');
        const { GLTFLoader: GLTFLoaderModule } = require('three/examples/jsm/loaders/GLTFLoader');
        
        GLView = GLViewModule;
        Renderer = RendererModule;
        THREE = THREEModule;
        Asset = AssetModule;
        GLTFLoader = GLTFLoaderModule;
        return true;
    } catch (e) {
        console.warn('3D libraries not available:', e.message);
        return false;
    }
};

export const Exercise3DView = ({ workoutName, stepIndex, modelPath }) => {
    const mixerRef = useRef(null);
    const sceneRef = useRef(null);
    const [is3DAvailable, setIs3DAvailable] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load3DLibraries().then(available => {
            setIs3DAvailable(available);
            setLoading(false);
        });
    }, []);

    const getModelPath = () => {
        if (modelPath) return modelPath;
        return null;
    };

    const resolvedModelPath = getModelPath();

    const onContextCreate = async (gl) => {
        try {
            const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf5f5f5);
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            camera.position.z = 3;

            const renderer = new Renderer({ gl });
            renderer.setSize(width, height);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            // Load Model
            if (!resolvedModelPath) {
                console.warn('No model path found for', workoutName);
                gl.endFrameEXP();
                return;
            }

            const asset = Asset.fromModule(resolvedModelPath);
            await asset.downloadAsync();

            const loader = new GLTFLoader();
            loader.load(asset.uri, (gltf) => {
                const model = gltf.scene;
                model.scale.set(1, 1, 1);
                scene.add(model);

                // Animation setup
                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model);
                    mixerRef.current = mixer;

                    const animationIndex = Math.min(stepIndex, gltf.animations.length - 1);
                    const action = mixer.clipAction(gltf.animations[animationIndex]);
                    action.clampWhenFinished = true;
                    action.play();
                }
            }, undefined, (error) => {
                console.error('Model loading error:', error);
            });

            const clock = new THREE.Clock();

            const render = () => {
                requestAnimationFrame(render);

                const delta = clock.getDelta();
                if (mixerRef.current) {
                    mixerRef.current.update(delta);
                }

                renderer.render(scene, camera);
                gl.endFrameEXP();
            };

            render();
        } catch (error) {
            console.error('3D Rendering Error:', error);
            gl.endFrameEXP();
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!is3DAvailable) {
        return null; // Fallback to emoji visualization
    }

    if (!resolvedModelPath) {
        return null;
    }

    return (
        <View style={styles.container}>
            <GLView 
                style={styles.glView} 
                onContextCreate={onContextCreate}
                key={`${workoutName}-${stepIndex}`}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    glView: {
        flex: 1,
    },
    loadingContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
});

export default Exercise3DView;
