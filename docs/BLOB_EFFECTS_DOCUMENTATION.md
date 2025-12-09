# WebGL Blob Effects Configuration Guide

## Overview

The WebGL blob effects system provides a highly configurable floating blob background with hardware-accelerated animations. This system replaces heavy SVG-based implementations with performant WebGL rendering using React Three Fiber.

## Usage

```tsx
import { OptimizedDynamicBackground, BlobPresets, BlobEffectConfig } from "./webgl-mesh-gradient";

// Using preset
<OptimizedDynamicBackground preset="subtle">
  <YourContent />
</OptimizedDynamicBackground>

// Using custom configuration
<OptimizedDynamicBackground 
  blobConfig={{
    blobCount: 4,
    scaleMultiplier: 0.8,
    speedMultiplier: 0.6
  }}
>
  <YourContent />
</OptimizedDynamicBackground>

// Using both preset and override
<OptimizedDynamicBackground 
  preset="dramatic"
  blobConfig={{
    opacity: 0.4  // Override just the opacity
  }}
>
  <YourContent />
</OptimizedDynamicBackground>
```

## Configuration Parameters

### Core Animation Settings

#### `blobCount` (number, 1-20, default: 6)
**Effect**: Controls how many floating blobs are rendered
- **1-3**: Minimal, clean aesthetic
- **4-6**: Balanced visual interest 
- **7-12**: Rich, dynamic background
- **13-20**: Very busy, high-impact (performance cost)

#### `scaleMultiplier` (number, 0.1-5.0, default: 1.0)
**Effect**: Scales all blob sizes uniformly
- **0.1-0.5**: Tiny, subtle blobs
- **0.6-0.9**: Small, delicate blobs
- **1.0**: Default sizing (2.8 max scale becomes ~280px)
- **1.1-2.0**: Larger, more prominent blobs
- **2.0+**: Very large, screen-filling blobs

#### `speedMultiplier` (number, 0.1-3.0, default: 1.0)
**Effect**: Controls overall animation speed
- **0.1-0.3**: Very slow, meditative movement
- **0.4-0.8**: Gentle, relaxing motion
- **1.0**: Default speed
- **1.2-2.0**: Energetic, lively movement
- **2.0+**: Fast, dynamic animations

### Movement & Physics

#### `movementAmplitude` (number, 0.1-5.0, default: 2.0)
**Effect**: How far blobs float from their starting positions
- **0.1-0.8**: Tight, constrained movement
- **1.0-2.0**: Natural floating motion
- **2.5-4.0**: Wide, sweeping movements
- **4.0+**: Extreme, screen-crossing motion

#### `rotationIntensity` (number, 0.0-1.0, default: 0.1)
**Effect**: Amount of blob rotation during movement
- **0.0**: No rotation (purely floating)
- **0.05-0.15**: Subtle rotation
- **0.2-0.5**: Noticeable spinning
- **0.5+**: Strong rotation effects

#### `pulseIntensity` (number, 0.0-0.5, default: 0.1)
**Effect**: How much blobs grow/shrink in size
- **0.0**: No size pulsing
- **0.05-0.1**: Gentle breathing effect
- **0.15-0.3**: Noticeable pulsing
- **0.3+**: Dramatic size changes

### Visual Properties

#### `opacity` (number, 0.1-1.0, default: 0.6)
**Effect**: Transparency of all blobs
- **0.1-0.3**: Very subtle, ghostly
- **0.4-0.6**: Balanced visibility
- **0.7-0.9**: Strong presence
- **1.0**: Completely opaque

### Camera & Lighting

#### `cameraFov` (number, 30-120, default: 60)
**Effect**: Field of view affects perspective distortion
- **30-45**: Narrow, telephoto-like (less distortion)
- **50-70**: Natural perspective
- **80-120**: Wide-angle, more dramatic

#### `cameraDistance` (number, 5-20, default: 10)
**Effect**: How far the camera is from the blobs
- **5-7**: Close-up, larger apparent blob sizes
- **8-12**: Balanced view
- **13-20**: Distant view, smaller apparent sizes

#### `ambientLight` (number, 0.1-2.0, default: 0.8)
**Effect**: Overall scene brightness
- **0.1-0.4**: Dark, moody atmosphere
- **0.5-1.0**: Balanced lighting
- **1.1-2.0**: Bright, high-key lighting

#### `directionalLight` (number, 0.0-1.0, default: 0.3)
**Effect**: Directional light creates depth and shadows
- **0.0**: Flat lighting
- **0.1-0.4**: Subtle depth
- **0.5-1.0**: Strong directional lighting

## Preset Configurations

### `subtle`
Perfect for content-focused designs where the background should not distract:
```typescript
{
  blobCount: 4,
  scaleMultiplier: 0.8,
  speedMultiplier: 0.5,
  movementAmplitude: 1.5,
  opacity: 0.4,
  pulseIntensity: 0.05,
}
```

### `default`
Balanced configuration suitable for most use cases:
```typescript
{
  blobCount: 6,
  scaleMultiplier: 1.0,
  speedMultiplier: 1.0,
  movementAmplitude: 2.0,
  opacity: 0.6,
  pulseIntensity: 0.1,
}
```

### `dramatic`
High-impact configuration for hero sections or landing pages:
```typescript
{
  blobCount: 8,
  scaleMultiplier: 1.5,
  speedMultiplier: 1.8,
  movementAmplitude: 3.0,
  opacity: 0.8,
  pulseIntensity: 0.2,
}
```

### `minimal`
Ultra-clean configuration for professional applications:
```typescript
{
  blobCount: 3,
  scaleMultiplier: 1.2,
  speedMultiplier: 0.3,
  movementAmplitude: 1.0,
  opacity: 0.3,
  pulseIntensity: 0.03,
}
```

## Performance Considerations

### Blob Count Impact
- **1-6 blobs**: Excellent performance on all devices
- **7-12 blobs**: Good performance on modern devices
- **13+ blobs**: May impact performance on lower-end devices

### Optimization Tips
1. Use lower `blobCount` for mobile devices
2. Reduce `pulseIntensity` and `rotationIntensity` for better performance
3. Lower `opacity` can improve rendering performance
4. Consider using `minimal` or `subtle` presets for content-heavy pages

## Color Customization

The system uses a predefined color palette based on the original mesh gradient layers:

- **Primary colors**: `#e0f2fe`, `#bfdbfe`, `#c7d2fe` (light blues and purples)
- **Warm accents**: `#fed7aa` (warm orange)
- **Natural tones**: `#bbf7d0` (soft green)
- **Golden highlights**: `#fde68a` (golden yellow)

## Browser Compatibility

- **Modern browsers**: Full WebGL support with hardware acceleration
- **Older browsers**: Automatic fallback to static gradient background
- **Mobile devices**: Optimized for touch devices with appropriate performance scaling

## Troubleshooting

### Blobs appear too small/large
Adjust `scaleMultiplier` and `cameraDistance`

### Animation too fast/slow
Modify `speedMultiplier` 

### Too many/few blobs visible
Change `blobCount`

### Poor performance
Reduce `blobCount`, lower `pulseIntensity`, use `subtle` preset

### Blobs not moving far enough
Increase `movementAmplitude`