/**
 * Camera Utility Functions
 * Helper functions for camera access and permissions
 */

import { CameraDevice } from '@/types/barcode';

/**
 * Check if camera permission is granted
 * @returns Promise<boolean> - Whether camera permission is granted
 */
export async function checkCameraPermission(): Promise<boolean> {
  try {
    if (!navigator.permissions) {
      // Permissions API not available, try to access camera directly
      return requestCameraPermission();
    }

    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return result.state === 'granted';
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return false;
  }
}

/**
 * Request camera permission
 * @returns Promise<boolean> - Whether camera permission was granted
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Stop the stream immediately after getting permission
    stream.getTracks().forEach(track => track.stop());

    return true;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
}

/**
 * Get list of available cameras
 * @returns Promise<CameraDevice[]> - Array of available camera devices
 */
export async function getAvailableCameras(): Promise<CameraDevice[]> {
  try {
    // Request permission first
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) {
      const granted = await requestCameraPermission();
      if (!granted) {
        return [];
      }
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices
      .filter(device => device.kind === 'videoinput')
      .map(device => ({
        id: device.deviceId,
        label: device.label || `Camera ${device.deviceId.substring(0, 5)}`,
        kind: 'videoinput' as const,
      }));

    return cameras;
  } catch (error) {
    console.error('Error getting available cameras:', error);
    return [];
  }
}

/**
 * Get preferred camera (rear camera on mobile, default on desktop)
 * @returns Promise<string | null> - Camera device ID or null
 */
export async function getPreferredCamera(): Promise<string | null> {
  try {
    const cameras = await getAvailableCameras();

    if (cameras.length === 0) {
      return null;
    }

    // Look for rear camera (environment facing) on mobile
    const rearCamera = cameras.find(camera =>
      camera.label.toLowerCase().includes('back') ||
      camera.label.toLowerCase().includes('rear') ||
      camera.label.toLowerCase().includes('environment')
    );

    if (rearCamera) {
      return rearCamera.id;
    }

    // Return first available camera
    return cameras[0].id;
  } catch (error) {
    console.error('Error getting preferred camera:', error);
    return null;
  }
}

/**
 * Check if device has camera
 * @returns Promise<boolean> - Whether device has camera
 */
export async function hasCamera(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return false;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error checking for camera:', error);
    return false;
  }
}

/**
 * Get camera constraints for optimal scanning
 * @param cameraId - Optional camera device ID
 * @returns MediaStreamConstraints
 */
export function getCameraConstraints(cameraId?: string): MediaStreamConstraints {
  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: 'environment', // Prefer rear camera
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  };

  if (cameraId) {
    constraints.video = {
      ...constraints.video as MediaTrackConstraints,
      deviceId: { exact: cameraId },
    };
  }

  return constraints;
}

/**
 * Check if device is mobile
 * @returns boolean - Whether device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if torch/flashlight is supported
 * @param stream - MediaStream
 * @returns boolean - Whether torch is supported
 */
export function isTorchSupported(stream: MediaStream | null): boolean {
  if (!stream) return false;

  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) return false;

  const capabilities = videoTrack.getCapabilities?.();
  return !!(capabilities && 'torch' in capabilities);
}

/**
 * Toggle torch/flashlight
 * @param stream - MediaStream
 * @param enabled - Whether to enable torch
 * @returns Promise<boolean> - Whether torch was toggled successfully
 */
export async function toggleTorch(stream: MediaStream | null, enabled: boolean): Promise<boolean> {
  if (!stream) return false;

  try {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return false;

    const capabilities = videoTrack.getCapabilities?.();
    if (!capabilities || !('torch' in capabilities)) {
      return false;
    }

    await videoTrack.applyConstraints({
      // @ts-ignore - torch is not in standard types yet
      advanced: [{ torch: enabled }],
    });

    return true;
  } catch (error) {
    console.error('Error toggling torch:', error);
    return false;
  }
}

/**
 * Stop all camera streams
 * @param stream - MediaStream to stop
 */
export function stopCameraStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}
