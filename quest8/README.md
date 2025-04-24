[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/NHj7IH5P)

# Quest 8: The Enchantment of Light and Texture

## Objectives

Welcome, Adept!

Having mastered the arcane arts of basic ray tracing and volume rendering, it is time to breathe life into your creations. Light and texture are the spells that transform flat, lifeless objects into rich, immersive worlds. In this quest, you will implement shading models and texture mapping to enhance the realism of your ray-traced scenes.

By the end of this journey, you will wield the power to simulate material properties using Phong and Toon models, map textures onto objects, and conjure illusionary surface details using bump mapping and environment mapping.

## Quest Overview

metal texture https://opengameart.org/content/metal-texture

This quest focuses on lighting models and texture mapping in ray tracing:

1. Illumination Spells: Implement various shading models to simulate the interplay of light and surfaces.
2. exturing Enchantments: Apply texture mapping techniques, including bump maps and environment maps.
3. Special Effects: Explore advanced rendering techniques to craft visually compelling scenes.

**Note**: for now, our ray tracer only trace one ray per pixel. We will cast secondary rays in the next quest.

## Feature Points

Earn feature point listed below is worth **1 point**. The total possible points for this quest are **10+** for the entire quest. You only need 60 points from 10 quests. Do as many as you want. On average, you should get 6 points per quest.

~ 6 points

### Light Source

~~- **1 point**: Implement and demonstrate point light~~

~~- **1 point**: Implement and demonstrate directional light~~

~~- **1 point**: Implement and demonstrate spotlight~~

### Shading Models

~~- **1 point**: Implement and demonstrate Lambertian shading (aka flat shading) with diffuse colors~~

~~- **1 point**: Implement and demonstrate Phong shading with diffuse, specular, and ambient colors~~

~~- **1 point**: Implement and demonstrate Tone shading (aka cal shading) on top of Phong shading~~

- **1 point**: (Repeatable, 1 point per shading model) Implement and demonstrate other shading model (e.g. Blinn-Phong shading, Cook-Torrance shading etc.).

### Texture Mapping

- **1 point**: Implement and demonstrate diffuse texture mapping. i.e. one object/surface in the scene should use texture to modulate its diffuse color.
- **1 point**: Implement and demonstrate bump mapping to simulate surface roughness. i.e. one object/surface should use normal texture to modulate its normal computation.
- **1 point**: Implement and demonstrate environment mapping (aka cube mapping or spherical mapping) to simulate an environment.
- **1 point**: Implement and demonstrate procedural textures. e.g. checkerboard pattern, Perline noise etc.

### Special Effects

- **1 point**: Repeatable, 1 point per object/surface) Simulate real life object/surface. e.g. metal, skin, wax, plastic etc.

- **1 point**: Compose an interesting 3D scene.

### Others

- **1 point**: Win the weekly quest contest. On Monday, in class, you will vote for the best craft of the week. **If you win, you earn an extra point!**
- **? points**: Anything that impresses me (e.g. additional advanced shading). **Write them clearly in your description to convince me they are impressive!**

### Submission Instructions

- Fork this quest repository to begin your quest and ensure you commit your code there before the due date.
- Ensure your Arcane Portal is public and contains all relevant and **obfuscated** code. I recommend you update the Arcane Portal every time you complete a quest.
- Your Arcane Portal site should display the visual effect(s) and include any required descriptions.

### Resources

- Refer to **[Scroll 20](https://eg.bucknell.edu/~scl019/Courses/CGSP25/scroll20.php)** for light sources and shading models.
- Consult **[Scroll 21](https://eg.bucknell.edu/~scl019/Courses/CGSP25/scroll21.php)** for texture mapping and resources.
- Consult **[Scroll 22](https://eg.bucknell.edu/~scl019/Courses/CGSP25/scroll22.php)** for recap.
- [WGSL documentation](https://www.w3.org/TR/WGSL/).
- Reach out and ask questions on [Piazza](https://piazza.com/bucknell/spring2025/csci379) if you are stuck!
