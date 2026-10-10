const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function makeTournamentFrameTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const base = context.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, '#343a3d');
  base.addColorStop(.48, '#22282b');
  base.addColorStop(1, '#151a1d');
  context.fillStyle = base;
  context.fillRect(0, 0, 512, 512);
  for (let index = 0; index < 96; index += 1) {
    const y = Math.random() * 512;
    context.strokeStyle = `rgba(${index % 2 ? '205,215,218' : '7,12,14'},${.018 + Math.random() * .028})`;
    context.lineWidth = .4 + Math.random() * 1.1;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(140, y + Math.random() * 3 - 1.5, 320, y + Math.random() * 3 - 1.5, 512, y + Math.random() * 3 - 1.5);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 4;
  return texture;
}

function lathePiece(THREE, profile, material, segments = 40) {
  const points = profile.map(([radius, height]) => new THREE.Vector2(radius, height));
  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function buildPiece(THREE, type, material, accentMaterial) {
  const group = new THREE.Group();
  const body = [[0, 0], [.36, .06], [.4, .12], [.3, .18], [.25, .24]];
  if (type === 'pawn') {
    group.add(lathePiece(THREE, [...body, [.14, .32], [.11, .5], [.19, .59], [.13, .68]], material));
    const head = new THREE.Mesh(new THREE.SphereGeometry(.17, 24, 20), material);
    head.position.y = .82;
    group.add(head);
  } else if (type === 'rook') {
    group.add(lathePiece(THREE, [...body, [.2, .28], [.3, .34], [.29, .42], [.21, .48], [.21, 1.05], [.34, 1.1], [.34, 1.2], [.25, 1.22]], material));
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(.34, .3, .14, 8), material);
    crown.position.y = 1.28;
    group.add(crown);
  } else if (type === 'bishop') {
    group.add(lathePiece(THREE, [...body, [.14, .34], [.12, .56], [.23, .72], [.25, .94], [.14, 1.13], [0, 1.28]], material));
    const finial = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), accentMaterial);
    finial.position.y = 1.3;
    group.add(finial);
  } else if (type === 'knight') {
    group.add(lathePiece(THREE, [...body, [.15, .3], [.13, .43]], material));
    const profile = new THREE.Shape();
    profile.moveTo(-.27, .32);
    profile.lineTo(.27, .32);
    profile.lineTo(.31, .43);
    profile.lineTo(.12, .54);
    profile.lineTo(.2, .82);
    profile.lineTo(.46, 1.02);
    profile.lineTo(.29, 1.11);
    profile.lineTo(.05, 1.07);
    profile.lineTo(-.05, 1.28);
    profile.lineTo(-.2, 1.37);
    profile.lineTo(-.19, 1.18);
    profile.lineTo(-.35, 1.04);
    profile.lineTo(-.38, .79);
    profile.lineTo(-.2, .63);
    profile.closePath();
    const horse = new THREE.Mesh(new THREE.ExtrudeGeometry(profile, { depth: .2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .045, bevelThickness: .045, curveSegments: 12 }), material);
    horse.position.z = -.1;
    group.add(horse);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 10), accentMaterial);
    eye.position.set(.26, 1.03, .11);
    group.add(eye);
  } else if (type === 'queen') {
    group.add(lathePiece(THREE, [...body, [.15, .31], [.12, .53], [.29, .69], [.3, .78], [.17, .87], [.22, .98], [.28, 1.1], [.34, 1.2], [.28, 1.25], [.18, 1.3]], material));
    const crown = new THREE.Mesh(new THREE.TorusGeometry(.25, .045, 10, 40), accentMaterial);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 1.27;
    group.add(crown);
    for (let index = 0; index < 8; index += 1) {
      const angle = index * Math.PI / 4;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(.065, 16, 12), accentMaterial);
      orb.position.set(Math.cos(angle) * .26, 1.34 + (index % 2 ? .015 : .07), Math.sin(angle) * .26);
      group.add(orb);
    }
  } else {
    group.add(lathePiece(THREE, [...body, [.15, .31], [.12, .55], [.26, .72], [.29, .82], [.17, .91], [.22, 1.05], [.31, 1.18], [.28, 1.24], [.17, 1.32], [.13, 1.42]], material));
    const crown = new THREE.Mesh(new THREE.BoxGeometry(.1, .38, .1), accentMaterial);
    crown.position.y = 1.55;
    group.add(crown);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(.31, .09, .1), accentMaterial);
    cross.position.y = 1.58;
    group.add(cross);
  }
  group.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
  return group;
}

export async function mountChessWorld(host) {
  let renderer;
  let observer;
  let frame = 0;
  let destroyed = false;
  let visible = false;
  let width = 1;
  let height = 1;
  let pointerX = 0;
  let pointerY = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 650px)').matches || navigator.hardwareConcurrency <= 4;
  const lowPower = matchMedia('(max-width: 900px)').matches || mobile;

  try {
    const THREE = await import('three');
    if (destroyed) return () => {};

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#11100e', .026);
    const camera = new THREE.PerspectiveCamera(33, 1, .1, 80);
    // Keep the camera on the board's center line so its near edge faces the viewer.
    const initialCamera = new THREE.Vector3(0, 2.5, 4.8);
    const settledCamera = new THREE.Vector3(0, 7.4, 16.5);
    camera.position.copy(initialCamera);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !lowPower, powerPreference: 'low-power', precision: lowPower ? 'mediump' : 'highp' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : lowPower ? 1.45 : 1.8));
    renderer.shadowMap.enabled = !lowPower;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'chess-world-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.append(renderer.domElement);

    const ambient = new THREE.HemisphereLight('#e8d5ac', '#17100b', 1.45);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight('#ffe8bc', lowPower ? 3.0 : 4.2);
    keyLight.position.set(-5, 10, 7);
    keyLight.castShadow = !lowPower;
    keyLight.shadow.mapSize.set(lowPower ? 512 : 1024, lowPower ? 512 : 1024);
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -9;
    keyLight.shadow.bias = -.0003;
    scene.add(keyLight);
    const rimLight = new THREE.PointLight('#c49a5e', 34, 20, 2);
    rimLight.position.set(5, 4, -5);
    scene.add(rimLight);
    const fillLight = new THREE.PointLight('#fff4dc', 12, 17, 2);
    fillLight.position.set(-3, 3, 4);
    scene.add(fillLight);

    const frameTexture = makeTournamentFrameTexture(THREE);
    const frameMaterial = new THREE.MeshStandardMaterial({ map: frameTexture, roughness: .4, metalness: .58 });
    const lightSquare = new THREE.MeshStandardMaterial({ color: '#e7e4d8', roughness: .72, metalness: 0 });
    const darkSquare = new THREE.MeshStandardMaterial({ color: '#31513f', roughness: .74, metalness: 0 });
    const ivory = new THREE.MeshPhysicalMaterial({ color: '#f0ede4', roughness: .3, metalness: .02, clearcoat: .12, clearcoatRoughness: .4 });
    const walnut = new THREE.MeshPhysicalMaterial({ color: '#222628', roughness: .34, metalness: .04, clearcoat: .12 });
    const gold = new THREE.MeshStandardMaterial({ color: '#b8ad91', roughness: .42, metalness: .32 });

    const board = new THREE.Group();
    board.rotation.y = 0;
    scene.add(board);
    const base = new THREE.Mesh(new THREE.BoxGeometry(8.8, .42, 8.8), frameMaterial);
    base.position.y = -.28;
    base.castShadow = true;
    base.receiveShadow = true;
    board.add(base);
    const innerBase = new THREE.Mesh(new THREE.BoxGeometry(8.42, .07, 8.42), frameMaterial);
    innerBase.position.y = -.045;
    board.add(innerBase);
    const inlay = new THREE.Mesh(new THREE.BoxGeometry(8.44, .012, 8.44), gold);
    inlay.position.y = -.006;
    board.add(inlay);
    const squareGeometry = new THREE.BoxGeometry(1, .085, 1);
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const square = new THREE.Mesh(squareGeometry, (rank + file) % 2 ? darkSquare : lightSquare);
        square.position.set(file - 3.5, .035, rank - 3.5);
        square.receiveShadow = true;
        board.add(square);
      }
    }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#100f0d', roughness: .92, metalness: .02 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -.54;
    ground.receiveShadow = true;
    scene.add(ground);

    const pieces = [];
    const order = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (const [rank, color, material] of [[0, 'white', ivory], [7, 'black', walnut]]) {
      for (let file = 0; file < 8; file += 1) {
        const type = order[file];
        let piece;
        piece = buildPiece(THREE, type, material, gold);
        piece.position.set(file - 3.5, .09, rank - 3.5);
        piece.scale.setScalar(type === 'queen' || type === 'king' ? .84 : .68);
        piece.userData.intro = pieces.length;
        pieces.push(piece);
        board.add(piece);
      }
      for (let file = 0; file < 8; file += 1) {
        const pawn = buildPiece(THREE, 'pawn', material, gold);
        pawn.position.set(file - 3.5, .09, (color === 'white' ? 1 : 6) - 3.5);
        pawn.scale.setScalar(.68);
        pawn.userData.intro = pieces.length;
        pieces.push(pawn);
        board.add(pawn);
      }
    }
    const queenSpotlight = new THREE.SpotLight('#f4d18c', 85, 16, Math.PI / 5, .62, 1.3);
    queenSpotlight.position.set(0, 8, 2.5);
    queenSpotlight.target.position.set(-.5, .3, -3.5);
    queenSpotlight.castShadow = !lowPower;
    scene.add(queenSpotlight, queenSpotlight.target);

    const particleCount = mobile ? 34 : lowPower ? 54 : 82;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      particlePositions[index * 3] = (Math.random() - .5) * 21;
      particlePositions[index * 3 + 1] = Math.random() * 8 + .2;
      particlePositions[index * 3 + 2] = (Math.random() - .5) * 16;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: '#d2bc91', size: mobile ? .025 : .032, transparent: true, opacity: .29, sizeAttenuation: true }));
    scene.add(particles);

    const onResize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const interactionSurface = host.closest('.hero-art') ?? host;
    const onPointer = event => {
      const rect = interactionSurface.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - .5) * 2;
    };
    const onPointerLeave = () => { pointerX = 0; pointerY = 0; };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(host);
    interactionSurface.addEventListener('pointermove', onPointer, { passive: true });
    interactionSurface.addEventListener('pointerleave', onPointerLeave, { passive: true });
    onResize();
    renderer.render(scene, camera);

    let lastTime = 0;
    let introStart = performance.now();
    let introStarted = false;
    const tick = time => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      if (lowPower && time - lastTime < 32) return;
      lastTime = time;
      const intro = reducedMotion ? 1 : clamp((time - introStart) / 2600, 0, 1);
      const reveal = 1 - (1 - intro) ** 3;
      const hostTop = host.getBoundingClientRect().top;
      const scrollProgress = clamp((window.innerHeight - hostTop) / (window.innerHeight + host.offsetHeight), 0, 1);
      const cameraEase = reducedMotion ? 1 : clamp((reveal + scrollProgress * .28), 0, 1);
      const desired = initialCamera.clone().lerp(settledCamera, cameraEase);
      desired.x += reducedMotion ? 0 : pointerX * (mobile ? .12 : .38);
      desired.y += reducedMotion ? 0 : pointerY * (mobile ? .05 : .14);
      camera.position.lerp(desired, reducedMotion ? 1 : .045);
      camera.lookAt(0, .14 + scrollProgress * .3, 0);
      const sweep = reducedMotion ? .45 : (Math.sin(time * .00024) + 1) * .5;
      queenSpotlight.position.x = -4 + sweep * 8;
      rimLight.intensity = 30 + sweep * 8;
      pieces.forEach((piece, index) => {
        const stagger = (index % 16) * .034;
        const rise = reducedMotion ? 1 : clamp((intro - stagger) / .33, 0, 1);
        const easedRise = rise * rise * (3 - 2 * rise);
        piece.position.y = .09 - (1 - easedRise) * 1.25;
        piece.visible = rise > .005;
      });
      if (!reducedMotion) particles.rotation.y = Math.sin(time * .00004) * .08;
      renderer.render(scene, camera);
    };
    const onDocumentVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else if (visible && !frame) frame = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onDocumentVisibility);
    observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible && !frame) { if(!introStarted){introStart = performance.now();introStarted=true;} frame = requestAnimationFrame(tick); }
      if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: '100px' });
    observer.observe(host);
    host.closest('.hero-art')?.classList.add('has-webgl');
    return () => {
      destroyed = true;
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onDocumentVisibility);
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      interactionSurface.removeEventListener('pointermove', onPointer);
      interactionSurface.removeEventListener('pointerleave', onPointerLeave);
      scene.traverse(object => {
        if (object.isMesh || object.isPoints) object.geometry?.dispose();
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
      });
      renderer.dispose();
      frameTexture.dispose();
      renderer.domElement.remove();
      host.closest('.hero-art')?.classList.remove('has-webgl');
    };
  } catch (error) {
    if (!destroyed) console.warn('3D board unavailable; showing the accessible chessboard fallback.', error);
    renderer?.dispose();
    renderer?.domElement?.remove();
    return () => { destroyed = true; observer?.disconnect(); renderer?.dispose(); };
  }
}
