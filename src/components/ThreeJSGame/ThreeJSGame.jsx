import React, { useEffect, useRef, useContext } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as CANNON from 'cannon-es'
import Hammer from 'hammerjs'
import cannonDebugger from 'cannon-es-debugger'
import "./ThreeJSGame.css"
import { UserContext } from '../../context/UserContext'
import { useNavigate } from "react-router-dom";
import { setBoosts, setLastTimestamp, setMaxDistance, setTotalCoins, setUserSettings } from '../../helpers/storageHelpers'
import { useTelegram } from '../../hooks/useTelegram'
import axios from 'axios'
import trCoin from '../ButtonLink/design/trCoin.png'

const ThreeJsGame = () => {
  const { userScore, setUserScore, userData, setUserData, authJWT } = useContext(UserContext)
  const navigate = useNavigate()
  const { webApp } = useTelegram()
  const hasInitialized = useRef(false);

  /**
  * Base
  */

  let clock = new THREE.Clock(),
    sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    scene,
    canvas,
    camera,
    world,
    directionalLight,
    renderer,
    mixer,
    last = 0,
    lastCoin = 0,
    lastCrystal = 0,
    loaded,
    mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    gameover,
    start,
    sideview,
    characterBody,
    leftFootBody,
    rightFootBody,
    groundPlane,
    stripe1,
    stripe2,
    leftFoot,
    rightFoot,
    leftFootTarget = new THREE.Vector3(),
    rightFootTarget = new THREE.Vector3(),
    groundPlaneGeometry = new THREE.PlaneGeometry(6, 40),
    floorBody = new CANNON.Body({
      collisionFilterGroup: 1,
    }),
    objectsToUpdate = [],
    columnsToUpdate = [],
    coinsToRemove = [],
    oldElapsedTime,
    jump,
    slide,
    fly,
    inSlide = false,
    inAir = false,
    inFly = false,
    moveLeft,
    moveRight,
    character,
    runAnim,
    idleAnim,
    jumpAnim,
    slideAnim,
    stumbleAnim,
    flyAnim,
    zloyCryst,
    smallCryst,
    redCryst,
    rainbow,
    coin,
    specialCoin,
    crystal,
    crystal2,
    crystal3,
    wings,
    sunMesh,
    topSpeed = 3,
    jumpForce = 6,
    lateralForce = 250,
    courseWidth = 4,
    characterSpeed = 6,
    slideTime = 0,
    slideDuration = 0.75,
    distanceBehindPlayer = 7.5,
    score = 0,
    body = document.querySelector('body'),
    gesture = Hammer(body),
    stumbleStarted = false,
    timeouts = [],
    chosenChar,
    sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFA95C, // Amber color
      side: THREE.FrontSide, // Ensures only the outside of the hemisphere is visible
    }),
    startColor = [148, 168, 247],
    endColor = [171, 164, 252],
    sunsetStartColor = [255, 138, 138],
    sunsetEndColor = [250, 164, 252],
    obstaclePlacements = [
      [-2, 0],
      [-2, 2],
      [2, 0],
    ],
    textureLoader,
    ajpinkMaterial,
    boyMaterial,
    robotPinkMaterial,
    robotMaterial,
    granPinkMaterial,
    granMaterial,
    cokPinkMaterial,
    cokMaterial,
    zaiMaterial,
    zaiPinkMaterial,
    coolmanMaterial,
    coolmanPinkMaterial,
    trapMaterial,
    trapPinkMaterial,
    coinMaterial,
    specialCoinMaterial,
    pinkStatusTime = 0,
    wingsStatusTime = 0,
    specialStatusTime = 0,
    wingsCount = 0,
    specialCount = 0,
    rainbowCount = 0,
    buttons = false,
    cameraMoves = false


  useEffect(() => {
    webApp.BackButton.hide()
    if (userData && !hasInitialized.current) {
      init();
      animate();
      createButtons()
      hasInitialized.current = true;
    }
    document.body.style.overflow = 'hidden';

    // Cleanup function
    return () => {
      document.body.style.overflow = '';
      document.body.style.backgroundImage = `linear-gradient(to top, #94a8f7 15%, #aba4fc 100%)`
    };

  }, [userData]);

  function createButtons(){
    buttons = userData.settings?.find(setting => setting?.name === 'buttons')?.value || false
    document.getElementById('buttons').style.backgroundColor = buttons ? '#bacbff' : '#6570b2'

    cameraMoves = userData.settings?.find(setting => setting?.name === 'cameraMoves')?.value || false
    document.getElementById('cameraMoves').style.backgroundColor = cameraMoves ? '#bacbff' : '#6570b2'

    wingsCount = userData.boosts.find(boost => boost.name === 'wings')?.amount || 0
    document.getElementById('wingsCount').innerText = String("🦋" + wingsCount)

    specialCount = userData.boosts.find(boost => boost.name === 'special')?.amount || 0
    document.getElementById('specialCount').innerText = String("🪙" + specialCount)

    rainbowCount = userData.boosts.find(boost => boost.name === 'rainbow')?.amount || 0
    document.getElementById('rainbowCount').innerText = String("🌈" + rainbowCount)

    document.getElementById('bottom-bar').style.visibility = buttons ? 'visible' : 'hidden'
    document.getElementById('tr-coin').style.visibility = 'hidden'
  }

  function createScene() {
    canvas = document.querySelector('canvas.webgl')
    scene = new THREE.Scene()
    {
      const near = 8
      const far = 36
      const color = '#f9a5a4'
      scene.fog = new THREE.Fog(color, near, far)
    }
  }

  function loadModels() {

    /**
    * Loading screen
    */

    const loadingManager = new THREE.LoadingManager(() => {
      const loadingScreen = document.getElementById('loading-screen')
      const timeout = setTimeout(function () {
        loadingScreen.classList.add('fade-out')
        loaded = true
        startGame()
      }, 1000)
      timeouts.push(timeout)
    })

    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100
      if (progress) {
        document.getElementById('progress-bar').style.width = progress + '%'
      }
    }

    /**
     * Loaders
     */
    // Texture loader
    textureLoader = new THREE.TextureLoader(loadingManager)

    // Draco loader
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('draco/')

    // GLTF loader
    const gltfLoader = new GLTFLoader(loadingManager)
    gltfLoader.setDRACOLoader(dracoLoader)

    /**
    * Textures
    */

    const coinTexture = textureLoader.load('texturecoin.jpg')
    coinTexture.flipY = true
    coinTexture.encoding = THREE.sRGBEncoding

    const specialCoinTexture = textureLoader.load('coin.jpg')
    specialCoinTexture.flipY = true
    specialCoinTexture.encoding = THREE.sRGBEncoding

    const redCrystTexture = textureLoader.load('crystobst.jpg')
    redCrystTexture.flipY = false
    redCrystTexture.encoding = THREE.sRGBEncoding

    const zloyCrystTexture = textureLoader.load('zloyobst.jpg')
    zloyCrystTexture.flipY = false
    zloyCrystTexture.encoding = THREE.sRGBEncoding

    const smallCrystTexture = textureLoader.load('smallcryst.jpg')
    smallCrystTexture.flipY = false
    smallCrystTexture.encoding = THREE.sRGBEncoding

    const crystalTexture = textureLoader.load('crystal1.jpg')
    crystalTexture.flipY = false
    crystalTexture.encoding = THREE.sRGBEncoding

    const crystal2Texture = textureLoader.load('crystal2.jpg')
    crystal2Texture.flipY = false
    crystal2Texture.encoding = THREE.sRGBEncoding

    const crystal3Texture = textureLoader.load('crystal3.jpg')
    crystal3Texture.flipY = false
    crystal3Texture.encoding = THREE.sRGBEncoding

    const rainbowTexture = textureLoader.load('rainbow.jpg')
    rainbowTexture.flipY = false
    rainbowTexture.encoding = THREE.sRGBEncoding

    const wingsTexture = textureLoader.load('wings.jpg')
    wingsTexture.flipY = false
    wingsTexture.encoding = THREE.sRGBEncoding

    /**
     * Materials
     */

    const zloyCrystMaterial = new THREE.MeshBasicMaterial({
      map: zloyCrystTexture,
    })

    const smallCrystMaterial = new THREE.MeshBasicMaterial({
      map: smallCrystTexture,
    })

    const redCrystMaterial = new THREE.MeshBasicMaterial({
      map: redCrystTexture,
    })

    const crystalMaterial = new THREE.MeshBasicMaterial({
      map: crystalTexture,
    })

    const crystal2Material = new THREE.MeshBasicMaterial({
      map: crystal2Texture,
    })

    const crystal3Material = new THREE.MeshBasicMaterial({
      map: crystal3Texture,
    })

    const rainbowMaterial = new THREE.MeshBasicMaterial({
      map: rainbowTexture,
    })

    const wingsMaterial = new THREE.MeshBasicMaterial({
      map: wingsTexture,
    })

    coinMaterial = new THREE.MeshBasicMaterial({ map: coinTexture })

    specialCoinMaterial = new THREE.MeshBasicMaterial({ map: specialCoinTexture })
    // Character
    chosenChar = userData.skins.find(skin => skin.isChosen)
    if (chosenChar.name === 'runner') {
      const boyTexture = textureLoader.load('aj.jpg')
      boyTexture.flipY = false
      boyTexture.encoding = THREE.sRGBEncoding

      boyMaterial = new THREE.MeshBasicMaterial({
        map: boyTexture,
      })
      const ajpink = textureLoader.load('ajpink.jpg')
      ajpink.flipY = false
      ajpink.encoding = THREE.sRGBEncoding
      ajpinkMaterial = new THREE.MeshBasicMaterial({
        map: ajpink,
      })
      gltfLoader.load('aj.glb', (gltf) => {
        gltf.scene.traverse((child) => {
          child.material = boyMaterial
          child.castShadow = true
        })
        character = gltf.scene
        character.position.set(0, 0, -12)
        mixer = new THREE.AnimationMixer(gltf.scene.children[0])
        runAnim = mixer.clipAction(gltf.animations[3])
        idleAnim = mixer.clipAction(gltf.animations[1])
        jumpAnim = mixer.clipAction(gltf.animations[2])
        slideAnim = mixer.clipAction(gltf.animations[4])
        stumbleAnim = mixer.clipAction(gltf.animations[5])
        flyAnim = mixer.clipAction(gltf.animations[0])
        scene.add(gltf.scene)
      })
    }

    if (chosenChar.name === 'robot') {
      gltfLoader.load('robot.glb', (gltf) => {

        const robotTexture = textureLoader.load('robot.jpg')
        robotTexture.flipY = false
        robotTexture.encoding = THREE.sRGBEncoding

        const robotpinkTexture = textureLoader.load('robotgold.jpg')
        robotpinkTexture.flipY = false
        robotpinkTexture.encoding = THREE.sRGBEncoding

        robotMaterial = new THREE.MeshBasicMaterial({
          map: robotTexture,
        })

        robotPinkMaterial = new THREE.MeshBasicMaterial({
          map: robotpinkTexture,
        })

        gltf.scene.traverse((child) => {
          child.material = robotMaterial
          child.castShadow = true
        })
        character = gltf.scene
        character.position.set(0, 0, -12)
        character.rotation.y = - Math.PI / 2
        character.scale.set(1.5, 1.5, 1.5)
        mixer = new THREE.AnimationMixer(gltf.scene.children[0])
        runAnim = mixer.clipAction(gltf.animations[3])
        idleAnim = mixer.clipAction(gltf.animations[1])
        jumpAnim = mixer.clipAction(gltf.animations[2])
        slideAnim = mixer.clipAction(gltf.animations[4])
        stumbleAnim = mixer.clipAction(gltf.animations[5])
        flyAnim = mixer.clipAction(gltf.animations[0])
        scene.add(gltf.scene)
      })
    }

    if (chosenChar.name === 'cok') {

      const cokTexture = textureLoader.load('cok.jpg')
      cokTexture.flipY = false
      cokTexture.encoding = THREE.sRGBEncoding

      const cokPinkTexture = textureLoader.load('cok2.jpg')
      cokPinkTexture.flipY = false
      cokPinkTexture.encoding = THREE.sRGBEncoding

      cokMaterial = new THREE.MeshBasicMaterial({
        map: cokTexture,
      })

      cokPinkMaterial = new THREE.MeshBasicMaterial({
        map: cokPinkTexture,
      })

      gltfLoader.load('cok.glb', (gltf) => {
        gltf.scene.traverse((child) => {
          child.material = cokMaterial
          child.castShadow = true
        })
        character = gltf.scene
        character.scale.set(1.5, 1.5, 1.5)
        character.position.set(0, 0, -12)
        character.rotation.y = - Math.PI / 2
        mixer = new THREE.AnimationMixer(gltf.scene.children[0])
        runAnim = mixer.clipAction(gltf.animations[3])
        idleAnim = mixer.clipAction(gltf.animations[1])
        jumpAnim = mixer.clipAction(gltf.animations[2])
        slideAnim = mixer.clipAction(gltf.animations[4])
        stumbleAnim = mixer.clipAction(gltf.animations[5])
        flyAnim = mixer.clipAction(gltf.animations[0])
        scene.add(gltf.scene)
      })
    }

    if (chosenChar.name === 'gran') {

      const granTexture = textureLoader.load('gran.jpg')
      granTexture.flipY = false
      granTexture.encoding = THREE.sRGBEncoding

      const granPinkTexture = textureLoader.load('gran2.jpeg')
      granPinkTexture.flipY = false
      granPinkTexture.encoding = THREE.sRGBEncoding

      granMaterial = new THREE.MeshBasicMaterial({
        map: granTexture,
      })

      granPinkMaterial = new THREE.MeshBasicMaterial({
        map: granPinkTexture,
      })

      gltfLoader.load('gran.glb', (gltf) => {
        console.log('gran', gltf)
        gltf.scene.traverse((child) => {
          child.material = granMaterial
          child.castShadow = true
        })
        character = gltf.scene
        character.position.set(0, 0, -12)
        character.scale.set(1.2, 1.2, 1.2)
        mixer = new THREE.AnimationMixer(gltf.scene.children[0])
        runAnim = mixer.clipAction(gltf.animations[3])
        idleAnim = mixer.clipAction(gltf.animations[1])
        jumpAnim = mixer.clipAction(gltf.animations[2])
        slideAnim = mixer.clipAction(gltf.animations[4])
        stumbleAnim = mixer.clipAction(gltf.animations[5])
        flyAnim = mixer.clipAction(gltf.animations[0])
        scene.add(gltf.scene)
      })
    }

    if (chosenChar.name === 'zai') {

      const zaiTexture = textureLoader.load('zai.jpg')
      zaiTexture.flipY = false
      zaiTexture.encoding = THREE.sRGBEncoding

      const zaiPinkTexture = textureLoader.load('zai2.jpg')
      zaiPinkTexture.flipY = false
      zaiPinkTexture.encoding = THREE.sRGBEncoding

      zaiMaterial = new THREE.MeshBasicMaterial({
        map: zaiTexture,
      })

      zaiPinkMaterial = new THREE.MeshBasicMaterial({
        map: zaiPinkTexture,
      })

      gltfLoader.load('zai.glb', (gltf) => {
        gltf.scene.traverse((child) => {
          child.material = zaiMaterial
          child.castShadow = true
        })
        character = gltf.scene
        character.position.set(0, 0, -12)
        character.rotation.y = - Math.PI / 2
        character.scale.set(2.0, 2.0, 2.0)
        mixer = new THREE.AnimationMixer(gltf.scene.children[0])
        console.log('anims', gltf.animations)
        runAnim = mixer.clipAction(gltf.animations[3])
        idleAnim = mixer.clipAction(gltf.animations[1])
        jumpAnim = mixer.clipAction(gltf.animations[2])
        slideAnim = mixer.clipAction(gltf.animations[4])
        stumbleAnim = mixer.clipAction(gltf.animations[5])
        flyAnim = mixer.clipAction(gltf.animations[0])
        scene.add(gltf.scene)
      })
    }

    if (chosenChar.name === 'coolman') {

      const coolmanTexture = textureLoader.load('coolman.jpg')
      coolmanTexture.flipY = false
      coolmanTexture.encoding = THREE.sRGBEncoding

      const coolmanPinkTexture = textureLoader.load('coolman2.jpg')
      coolmanPinkTexture.flipY = false
      coolmanPinkTexture.encoding = THREE.sRGBEncoding

      coolmanMaterial = new THREE.MeshBasicMaterial({
        map: coolmanTexture,
      })

      coolmanPinkMaterial = new THREE.MeshBasicMaterial({
        map: coolmanPinkTexture,
      })

      gltfLoader.load('coolman.glb', (gltf) => {
        gltf.scene.traverse((child) => {
          child.material = coolmanMaterial
          child.castShadow = true
        })
        character = gltf.scene
        character.position.set(0, 0, -12)
        character.rotation.y = - Math.PI / 2
        character.scale.set(2.0, 2.0, 2.0)
        mixer = new THREE.AnimationMixer(gltf.scene.children[0])
        console.log('anims', gltf.animations)
        runAnim = mixer.clipAction(gltf.animations[3])
        idleAnim = mixer.clipAction(gltf.animations[1])
        jumpAnim = mixer.clipAction(gltf.animations[2])
        slideAnim = mixer.clipAction(gltf.animations[4])
        stumbleAnim = mixer.clipAction(gltf.animations[5])
        flyAnim = mixer.clipAction(gltf.animations[0])
        scene.add(gltf.scene)
      })
    }

    if (chosenChar.name === 'trap') {

      const trapTexture = textureLoader.load('trap.jpg')
      trapTexture.flipY = false
      trapTexture.encoding = THREE.sRGBEncoding

      const trapPinkTexture = textureLoader.load('trap2.jpg')
      trapPinkTexture.flipY = false
      trapPinkTexture.encoding = THREE.sRGBEncoding

      trapMaterial = new THREE.MeshBasicMaterial({
        map: trapTexture,
      })

      trapPinkMaterial = new THREE.MeshBasicMaterial({
        map: trapPinkTexture,
      })

      gltfLoader.load('trap.glb', (gltf) => {
        gltf.scene.traverse((child) => {
          child.material = trapMaterial
          child.castShadow = true
        })
        character = gltf.scene
        character.position.set(0, 0, -12)
        character.rotation.y = - Math.PI / 2
        character.scale.set(2.0, 2.0, 2.0)
        mixer = new THREE.AnimationMixer(gltf.scene.children[0])
        console.log('anims', gltf.animations)
        runAnim = mixer.clipAction(gltf.animations[3])
        idleAnim = mixer.clipAction(gltf.animations[1])
        jumpAnim = mixer.clipAction(gltf.animations[2])
        slideAnim = mixer.clipAction(gltf.animations[4])
        stumbleAnim = mixer.clipAction(gltf.animations[5])
        flyAnim = mixer.clipAction(gltf.animations[0])
        scene.add(gltf.scene)
      })
    }

    /**
    * Models
    */
    gltfLoader.load('coin.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = coinMaterial
        child.castShadow = true
      })
      gltf.scene.name = 'Coin'
      coin = gltf.scene
    })

    gltfLoader.load('coin.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = specialCoinMaterial
        child.castShadow = true
      })
      gltf.scene.name = 'Special'
      specialCoin = gltf.scene
    })

    gltfLoader.load('rainbow.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = rainbowMaterial
        child.castShadow = true
      })
      gltf.scene.name = 'Rainbow'
      rainbow = gltf.scene
      rainbow.rotation.y = Math.PI / 2
      rainbow.rotation.x = Math.PI
    })

    gltfLoader.load('wings.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = wingsMaterial
        child.castShadow = true
      })
      gltf.scene.name = 'Wings'
      wings = gltf.scene
    })


    gltfLoader.load('crystal1.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = crystalMaterial
      })
      crystal = gltf.scene
      crystal.scale.set(7.5, 7.5, 7.5)
    })

    gltfLoader.load('crystal2.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = crystal2Material
      })
      crystal2 = gltf.scene
      crystal2.scale.set(7.5, 7.5, 7.5)
    })

    gltfLoader.load('crystal3.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = crystal3Material
      })
      crystal3 = gltf.scene
      crystal3.scale.set(7.5, 7.5, 7.5)
    })

    gltfLoader.load('crystobst.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = redCrystMaterial
        child.castShadow = true
      })
      redCryst = gltf.scene
      redCryst.rotation.y = Math.PI / 2
    })

    gltfLoader.load('zloyobst.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = zloyCrystMaterial
        child.castShadow = true
      })
      zloyCryst = gltf.scene
      zloyCryst.rotation.y = Math.PI / 2
    })


    gltfLoader.load('smallcryst.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        child.material = smallCrystMaterial
        child.castShadow = true
      })
      smallCryst = gltf.scene
      smallCryst.rotation.y = Math.PI / 2
    })
  }

  function createSun() {
    const sunGeometry = new THREE.SphereBufferGeometry(
      5,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );

    // Create a mesh from the geometry and material
    sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);

    // Position the sun mesh at the end of the road
    sunMesh.position.set(0, 0, 30);

    // Add the sun mesh to your scene
    scene.add(sunMesh);
  }

  function createGroundPlane() {

    // Change the material to MeshPhongMaterial or MeshLambertMaterial for color and shadow capability
    const groundPlaneMaterial = new THREE.MeshPhongMaterial({
      color: 0x0000aa, // Set the color to blue
      side: THREE.FrontSide, // Render both sides
      transparent: true, // 
    });
    groundPlaneMaterial.opacity = 0.3
    groundPlane = new THREE.Mesh(groundPlaneGeometry, groundPlaneMaterial);
    groundPlane.rotation.x = Math.PI * -0.5;
    groundPlane.position.y = 0;
    groundPlane.receiveShadow = true;
    // Don't forget to add your ground plane to the scene if you haven't already done so
    scene.add(groundPlane);
  }

  function createStripes() {
    const stripeWidth = 0.2; // The width of each stripe
    const stripeLength = groundPlaneGeometry.parameters.height; // The length of each stripe should match the ground plane's length
    const stripeColor = 0xffffff; // Set the color to white

    // Function to create a single stripe with proper material and geometry
    function createStripe() {
      const stripeGeometry = new THREE.PlaneGeometry(stripeWidth, stripeLength);
      const stripeMaterial = new THREE.MeshBasicMaterial({
        color: stripeColor,
        side: THREE.DoubleSide
      });
      return new THREE.Mesh(stripeGeometry, stripeMaterial);
    }

    // Calculate the spacing between stripes based on the ground plane's width
    const numStripes = 2;
    const spaceBetweenStripes = (groundPlaneGeometry.parameters.width - (numStripes * stripeWidth)) / (numStripes + 1);

    // Create and position the stripes
    stripe1 = createStripe();

    // Positioning the stripe
    stripe1.position.x = (-Math.floor(numStripes / 2)) * (stripeWidth + spaceBetweenStripes) + 1;
    stripe1.position.y = 0.1; // Slightly above the ground to avoid z-fighting
    stripe1.rotation.x = Math.PI * -0.5;
    // Add shadow capabilities if needed
    stripe1.receiveShadow = true;

    // Add the stripe as a child of the ground plane so they move together
    //stripesArr.push(stripe)
    scene.add(stripe1)

    stripe2 = createStripe();

    // Positioning the stripe
    stripe2.position.x = (1 - Math.floor(numStripes / 2)) * (stripeWidth + spaceBetweenStripes) + 1;
    stripe2.position.y = 0.1; // Slightly above the ground to avoid z-fighting
    stripe2.rotation.x = Math.PI * -0.5;
    // Add shadow capabilities if needed
    stripe2.receiveShadow = true;

    // Add the stripe as a child of the ground plane so they move together
    //stripesArr.push(stripe)
    scene.add(stripe2)
  }

  function loadPhysics() {
    world = new CANNON.World()
    world.gravity.set(0, -9.82, 0)
    world.broadphase = new CANNON.SAPBroadphase(world)

    // Physics materials
    const groundMaterial = new CANNON.Material('ground')
    const characterMaterial = new CANNON.Material('character')

    const groundCharacterContactMaterial = new CANNON.ContactMaterial(
      groundMaterial,
      characterMaterial,
      {
        friction: 0.5,
        restitution: 0.1,
      }
    )
    world.addContactMaterial(groundCharacterContactMaterial)
  }

  function createCollisionBodies() {
    // Sphere collider
    const sphereShape = new CANNON.Sphere(0.25)

    characterBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 0, 0),
      shape: sphereShape,
      angularDamping: 0.999,
      collisionFilterGroup: 2,
      collisionFilterMask: 1 | 10,
    })

    world.addBody(characterBody)

    // Foot colliders
    const footBoxShape = new CANNON.Box(new CANNON.Vec3(0.06, 0.075, 0.1))

    leftFootBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, 0),
      shape: footBoxShape,
      angularDamping: 1,
      collisionFilterGroup: 4,
      collisionFilterMask: 8,
      name: 'foot',
    })

    world.addBody(leftFootBody)

    rightFootBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, 0),
      shape: footBoxShape,
      angularDamping: 1,
      collisionFilterGroup: 4,
      collisionFilterMask: 8,
      name: 'foot',
    })

    world.addBody(rightFootBody)
  }

  function createFloor() {
    // Floor

    const floorShape = new CANNON.Plane()
    floorBody.mass = 0
    floorBody.addShape(floorShape)
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    )

    world.addBody(floorBody)
  }

  function createCollisionListeners(){
    characterBody.addEventListener('collide', (event) => {
      if (start && !stumbleStarted) {
        if (event.body === floorBody) {
          inAir = false
          blendAnim(runAnim, 0.1)
        }
        if (!inAir && inSlide && event.body === floorBody) {
          blendAnim(runAnim, 0.1); // Blend back into run animation after sliding
          inSlide = false; // We are not sliding anymore
        }
        if (event.body.name === 'foot') {
          endGame()
        }
      }
    })

    rightFootBody.addEventListener('collide', (event) => {
      if (start && (event.body.name === 'Obstacle')) {
        endGame()
      }
    })

    leftFootBody.addEventListener('collide', (event) => {
      if (start && (event.body.name === 'Obstacle')) {
        endGame()
      }
      if (start && event.body.name === 'Coin') {
        collectCoin(event.body.id)
      }
      if (start && event.body.name === 'Rainbow') {
        const rainbowMaterial = chosenChar.name === 'runner' ? ajpinkMaterial :
          chosenChar.name === 'robot' ? robotPinkMaterial :
            chosenChar.name === 'cok' ? cokPinkMaterial : 
            chosenChar.name === 'zai' ? zaiPinkMaterial : 
            chosenChar.name === 'coolman' ? coolmanPinkMaterial :
            chosenChar.name === 'trap' ? trapPinkMaterial : granPinkMaterial
        character.traverse((child) => {
          child.material = rainbowMaterial
          child.castShadow = true
        })
        pinkStatusTime = 5
      }
      if (start && event.body.name === 'Wings') {
        fly = true
        blendAnim(flyAnim)
        wingsStatusTime = 5
      }
      if (start && event.body.name === 'Special') {
        document.getElementById('left-scoreboard').style.color = 'blue'
        specialStatusTime = 5
        coin.traverse((child) => {
          child.material = specialCoinMaterial
          child.castShadow = true
        })
      }
    })

    // Ground Detections

    world.addEventListener('endContact', (event) => {
      if (start) {
        if (
          (event.bodyA === floorBody && event.bodyB === characterBody) ||
          (event.bodyB === floorBody && event.bodyA === characterBody)
        ) {
          inAir = true
          inFly = false
          if (!fly) {
            blendAnim(jumpAnim)
          }
        }
      }
    })  
  }

  function createWalls() {
    // Right Wall

    const rightWallShape = new CANNON.Plane()
    const rightWallBody = new CANNON.Body({
      collisionFilterGroup: 2,
    })
    rightWallBody.mass = 0
    rightWallBody.addShape(rightWallShape)
    rightWallBody.position.x = -(courseWidth / 2)
    rightWallBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(0, 1, 0),
      Math.PI * 0.5
    )

    world.addBody(rightWallBody)

    // Left Wall

    const leftWallShape = new CANNON.Plane()
    const leftWallBody = new CANNON.Body({
      collisionFilterGroup: 10,
    })
    leftWallBody.mass = 0
    leftWallBody.addShape(leftWallShape)
    leftWallBody.position.x = courseWidth / 2
    leftWallBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(0, -1, 0),
      Math.PI * 0.5
    )

    world.addBody(leftWallBody)
  }

  function createLights() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
    scene.add(directionalLight)
    directionalLight.position.set(0, 50, 40)
    directionalLight.castShadow = true
    directionalLight.intensity = 0.1; // Lower the value to make the light less intense

    // Optionally, change other properties like shadow radius for a softer shadow
    directionalLight.shadow.radius = 5;

    // If you want the light to cast softer and less pronounced shadows, you can adjust the shadow map resolution
    // Though keep in mind that lower values can lead to poorer quality shadows
    directionalLight.shadow.mapSize.width = 1024; // Lower the values for less detailed shadows
    directionalLight.shadow.mapSize.height = 1024;
  }

  function createCamera(){

    // Base camera
    camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 50)
    camera.position.x = 0
    camera.position.y = 3.5
    camera.position.z = -distanceBehindPlayer

    camera.rotation.y = Math.PI * 1

    scene.add(camera)
  }

  function loadRenderer(){
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
  }
  function resizeListener() {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  function addResizeListener(){
    window.addEventListener('resize', resizeListener)
  }
  
  function init() {
    THREE.Cache.enabled = true;
    createScene()
    createSun()
    createGroundPlane()
    createStripes()
    loadModels()
    loadPhysics()
    createCollisionBodies()
    createFloor()
    createCollisionListeners()
    createWalls()
    createLights()
    createCamera()
    loadRenderer()
    addResizeListener()
  }

  function animate(now) {
    requestAnimationFrame(animate)
    render(now)
  }

  function render(now) {
    if (gameover) return
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    if (!stumbleStarted) {
      // Move Character
      followPlayer(now)

      if (jump) {
        if (!inAir) {
          characterBody.applyImpulse(
            new CANNON.Vec3(0, jumpForce, 0),
            new CANNON.Vec3(0, characterBody.position.x, 0)
          )
          jump = false
        }
      }

      if (slide) {
        if (!inAir && !inSlide) {
          blendAnim(slideAnim);
          slideTime = 0; // Start the slide timer
          inSlide = true;
          slide = false; // Assuming slide is a one-time trigger, reset immediately

          // Neutralize any existing forward velocity. You might want to cache it if you need to restore
          // the same speed after the slide.
          // characterBody.velocity.z = 0; // Prevent the character from moving forward
        }
      }

      // Update the slide logic
      if (inSlide) {
        slideTime += deltaTime;
        if (slideTime > slideDuration) { // Slide time exceeds the defined duration
          blendAnim(runAnim, 0.1); // Blend back into run animation after sliding
          inSlide = false; // Not sliding anymore
          slideTime = 0; // Reset the slide timer

          // Optionally restore the character's forward velocity here if it was cached before the slide
          // characterBody.velocity.z = originalSpeed; // Restore the original forward speed
        } else {
          // Maintain zero forward velocity during the slide
          //characterBody.velocity.z = 0; // Continue to prevent forward motion
        }
      }

      if (moveLeft) {
        if (!inSlide && characterBody.velocity.x <= topSpeed) {
          characterBody.applyForce(
            new CANNON.Vec3(lateralForce, 0, 0),
            characterBody.position
          )
          moveLeft = false
        }
      }

      if (moveRight) {
        if (!inSlide && characterBody.velocity.x >= -topSpeed) {
          characterBody.applyForce(
            new CANNON.Vec3(-lateralForce, 0, 0),
            characterBody.position
          )
          moveRight = false
        }
      }

      world.step(1 / 60)
      if (document.getElementById('distance')) {
        document.getElementById('distance').innerText = String(
          Math.round(characterBody.position.z)
        ).padStart(3, '0') + "m"
      }
      objectsToUpdate.forEach((object, index) => {
        if (object.clone.name === 'Coin') {
          if (object.clone.name === 'Coin' && coinsToRemove.includes(object.body.id)) {
            coinsToRemove = coinsToRemove.filter(id => id !== object.body.id)
            scene.remove(object.clone)
            world.removeBody(object.body)
            objectsToUpdate.splice(index, 1)
            // Update scoreboard
            updateSunMaterialColor();
            document.body.style.backgroundImage = getDynamicGradient(score);
            score = specialStatusTime > 0 ? score + 10 : score + 1
            if (document.getElementById('score')) {
              document.getElementById('score').innerText = String(
                Math.round(score)
              ).padStart(3, '0')
            }
          } else {
            // object.body.velocity.set(0, 0, 0); // Neutralize gravity effect
            // object.body.angularVelocity.set(0, 0, 0); 
            object.clone.position.copy(object.body.position)
            if (wingsStatusTime > 0) {
              object.clone.position.y = 4
              object.body.position.y = 4
            }
            //object.clone.position.y = object.body.position.y - 0.5
            object.clone.rotation.x = -0.4
            object.clone.rotation.y += 0.1
          }
        } else if (object.clone.name === 'Rainbow') {
          if (pinkStatusTime !== 0) {
            scene.remove(object.clone)
            world.removeBody(object.body)
          } else {
            object.clone.rotation.y += 0.1
            object.clone.position.copy(object.body.position)
          }
        }
        else if (object.clone.name === 'Special') {
          if (specialStatusTime !== 0) {
            scene.remove(object.clone)
            world.removeBody(object.body)
          } else {
            object.clone.rotation.y += 0.1
            object.clone.position.copy(object.body.position)
          }
        }
        else if (object.clone.name === 'Obstacle') {
          if (pinkStatusTime !== 0) {
            scene.remove(object.clone)
            world.removeBody(object.body)
          }
          object.clone.position.copy(object.body.position)
        } else {
          object.clone.position.copy(object.body.position)
        }

        if (object.body.position.z < characterBody.position.z - 3) {
          scene.remove(object.clone)
          world.removeBody(object.body)
          objectsToUpdate.splice(index, 1)
        }
      })
      columnsToUpdate.forEach((object, index) => {
        if (object.clone.position.z < characterBody.position.z) {
          scene.remove(object.clone)
          columnsToUpdate.splice(index, 1)
        }
      })
      mixer?.update(deltaTime);
      renderer.render(scene, camera);
    } else {
      character.updateMatrix()
      characterBody.velocity.z = 0
      character.position.x = characterBody.position.x
      character.position.y = 0
      characterBody.position.y = 0
      groundPlane.position.z = characterBody.position.z
      stripe1.position.z = characterBody.position.z
      stripe2.position.z = characterBody.position.z

      directionalLight.position.z = characterBody.position.z - 2
      directionalLight.target = character

      world.step(1 / 60)
      camera.position.z = characterBody.position.z - distanceBehindPlayer
      mixer?.update(deltaTime);
      renderer.render(scene, camera);
    }

  }

  /**
   * Obstacles
   */

  const createStraightLineRandom = () => {
    const p1 = getPlacement();
    for (let i = -2; i <= 2; i++) {
      createCoin(p1, 0, i * 2);
    }
  }
  const createLineLeftToRight = () => {
    const startP1 = -1.5; // Starting further left
    for (let i = 0; i < 5; i++) {
      createCoin(startP1 + i*0.75, 0, i * 2); // Incrementing horizontally
    }
  };
  const createLineRightToLeft = () => {
    const startP1 = 1.5; // Starting further right
    for (let i = 0; i < 5; i++) {
      createCoin(startP1 - i*0.75, 0, i * 2); // Decrementing horizontally
    }
  };
  const createArchLine = () => {
    const p1 = getPlacement();
    const heights = [0, 1.2, 2, 1.2, 0]; // Heights relative to base height
    for (let i = 0; i < 5; i++) {
      createCoin(p1, heights[i], i * 2); // Adjust placement and use heights array for arch effect
    }
  };

  const coinCreationMethods = [
    createStraightLineRandom,
    createLineLeftToRight,
    createLineRightToLeft,
    //createArchLine,
  ];

  const crystalCreationMethods = [
    () => {
      createCrystal(-6, crystal);
      createCrystal(6, crystal)
    },
    () => {
      createCrystal(-6, crystal2);
      createCrystal(6, crystal2)
    },
    () => {
      createCrystal(-6, crystal3);
      createCrystal(6, crystal3)
    },
  ];
  const createCoin = (x, y, z) => {
    const size = 0.5
    const clone = coin.clone()
    clone.position.set(x, y, characterBody.position.z + 12 + z)
    //clone.scale.set(0.003, 0.003, 0.003) // Adjust scale if needed
    scene.add(clone)

    // Cannon body
    const shape = new CANNON.Box(
      new CANNON.Vec3(size, size, size)
    )

    const body = new CANNON.Body({
      mass: 1, // Set an appropriate mass for the obstacle
      position: new CANNON.Vec3(0, 1, 0),
      shape: shape,
      collisionFilterGroup: 8, // Make sure this group allows for collision with other obstacles
      collisionFilterMask: 1 | 4, // Collide with ground, feet, and other obstacles
    });
    body.linearDamping = 0.99; // Apply damping to reduce sliding and jumping
    body.angularDamping = 0.99;
    body.name = 'Coin'
    body.position.copy(clone.position)

    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ clone, body })
  }

  const createCrystal = (placement, obj) => {
    const clone = obj.clone()
    clone.rotation.y = Math.PI * Math.random()
    clone.position.set(placement, 0, characterBody.position.z + 25)
    //clone.scale.set(size, size, size) // Adjust scale if needed
    columnsToUpdate.push({ clone })
    scene.add(clone)
  }

  const createZloyObstacle = (placement) => {
    const size = 1.8
    const clone = zloyCryst.clone()
    clone.position.set(placement, size / 2, characterBody.position.z + 18)
    clone.scale.set(size, size, size) // Adjust scale if needed
    scene.add(clone)

    // Cannon body
    const shape = new CANNON.Box(
      new CANNON.Vec3(size * 0.5, size * 0.1, size * 0.1)
    )

    const body = new CANNON.Body({
      mass: 250, // Set an appropriate mass for the obstacle
      shape: shape,
      collisionResponse: false,
      collisionFilterGroup: 8, // Make sure this group allows for collision with other obstacles
      collisionFilterMask: 1 | 4, // Collide with ground, feet, and other obstacles
    });
    body.linearDamping = 0.999; // Apply damping to reduce sliding and jumping
    body.angularDamping = 0.999;

    body.name = 'Obstacle'
    body.position.copy(clone.position)
    body.collisionResponse = true;
    world.addBody(body)
    console.log('Clone Position:', clone.position);
    console.log('Body Position:', body.position);

    // Save in objects
    objectsToUpdate.push({ clone, body })
  }

  const createRedObstacle = (placement) => {
    const size = 1.8
    const clone = redCryst.clone()
    clone.position.set(placement, size / 2, characterBody.position.z + 18)
    clone.scale.set(size, size, size) // Adjust scale if needed
    scene.add(clone)

    // Cannon body
    const shape = new CANNON.Box(
      new CANNON.Vec3(size * 0.5, size * 0.1, size * 0.1)
    )

    const body = new CANNON.Body({
      mass: 250, // Set an appropriate mass for the obstacle
      shape: shape,
      collisionResponse: false,
      collisionFilterGroup: 8, // Make sure this group allows for collision with other obstacles
      collisionFilterMask: 1 | 4, // Collide with ground, feet, and other obstacles
    });
    body.linearDamping = 0.999; // Apply damping to reduce sliding and jumping
    body.angularDamping = 0.999;

    body.name = 'Obstacle'
    body.position.copy(clone.position)
    body.collisionResponse = true;
    world.addBody(body)
    console.log('Clone red Position:', clone.position);
    console.log('Body red Position:', body.position);
    // Save in objects
    objectsToUpdate.push({ clone, body })
  }

  const createSmallObstacle = (placement) => {
    const size = 1.5
    const clone = smallCryst.clone()
    clone.position.set(placement, size / 2, characterBody.position.z + 18)
    clone.scale.set(size, size, size) // Adjust scale if needed
    scene.add(clone)

    // Cannon body
    const shape = new CANNON.Box(
      new CANNON.Vec3(size * 0.5, size * 0.1, size * 0.1)
    )

    const body = new CANNON.Body({
      mass: 250, // Set an appropriate mass for the obstacle
      shape: shape,
      collisionResponse: false,
      collisionFilterGroup: 8, // Make sure this group allows for collision with other obstacles
      collisionFilterMask: 1 | 4, // Collide with ground, feet, and other obstacles
    });
    body.linearDamping = 0.999; // Apply damping to reduce sliding and jumping
    body.angularDamping = 0.999;

    body.name = 'Obstacle'
    body.position.copy(clone.position)
    body.collisionResponse = true;
    world.addBody(body)
    console.log('Clone red Position:', clone.position);
    console.log('Body red Position:', body.position);
    // Save in objects
    objectsToUpdate.push({ clone, body })
  }

  const createRainbow = (placement) => {
    const size = 2.5
    const clone = rainbow.clone()
    clone.position.set(placement, 0, characterBody.position.z + 12)
    clone.scale.set(size, size, size) // Adjust scale if needed
    scene.add(clone)

    // Cannon body
    const shape = new CANNON.Box(
      new CANNON.Vec3(size * 0.5, size * 0.5, size * 0.5)
    )

    const body = new CANNON.Body({
      mass: 25, // Set an appropriate mass for the obstacle
      position: new CANNON.Vec3(0, 1, 0),
      shape: shape,
      collisionFilterGroup: 8, // Make sure this group allows for collision with other obstacles
      collisionFilterMask: 1 | 4, // Collide with ground, feet, and other obstacles
    });
    body.linearDamping = 0.999; // Apply damping to reduce sliding and jumping
    body.angularDamping = 0.999;

    body.name = 'Rainbow'
    body.position.copy(clone.position)
    body.position.y = clone.position.y * 2
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ clone, body })
  }

  const createSpecialCoin = (placement) => {
    const size = 2
    const clone = specialCoin.clone()
    clone.position.set(placement, 0, characterBody.position.z + 12)
    clone.scale.set(size, size, size) // Adjust scale if needed
    scene.add(clone)

    // Cannon body
    const shape = new CANNON.Box(
      new CANNON.Vec3(size * 0.5, size * 0.5, size * 0.5)
    )

    const body = new CANNON.Body({
      mass: 25, // Set an appropriate mass for the obstacle
      position: new CANNON.Vec3(0, 1, 0),
      shape: shape,
      collisionFilterGroup: 8, // Make sure this group allows for collision with other obstacles
      collisionFilterMask: 1 | 4, // Collide with ground, feet, and other obstacles
    });
    body.linearDamping = 0.999; // Apply damping to reduce sliding and jumping
    body.angularDamping = 0.999;

    body.name = 'Special'
    body.position.copy(clone.position)

    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ clone, body })
  }

  const createWings = (placement) => {
    const size = 2.5
    const clone = wings.clone()
    clone.position.set(placement, 0, characterBody.position.z + 12)
    clone.scale.set(size, size, size) // Adjust scale if needed
    scene.add(clone)

    // Cannon body
    const shape = new CANNON.Box(
      new CANNON.Vec3(size * 0.5, size * 0.5, size * 0.5)
    )

    const body = new CANNON.Body({
      mass: 25, // Set an appropriate mass for the obstacle
      position: new CANNON.Vec3(0, 1, 0),
      shape: shape,
      collisionFilterGroup: 8, // Make sure this group allows for collision with other obstacles
      collisionFilterMask: 1 | 4, // Collide with ground, feet, and other obstacles
    });
    body.linearDamping = 0.999; // Apply damping to reduce sliding and jumping
    body.angularDamping = 0.999;

    body.name = 'Wings'
    body.position.copy(clone.position)
    body.position.y = clone.position.y * 2
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ clone, body })
  }

  const getPlacement = () => {
    const placementValues = [-1.5, 0, 1.5];
    const randomIndex = Math.floor(Math.random() * placementValues.length);

    // Return the placement value at the random index
    return placementValues[randomIndex];
  }

  /**
   * Input
   */

  // Keyboard Input

  const handleKeyDown = (keyEvent) => {
    if (!gameover && !mobile && start) {
      if (keyEvent.key === ' ' || keyEvent.key === 'ArrowUp') {
        //jump
        jump = true
      } else if (keyEvent.key === 's' || keyEvent.key === 'ArrowDown') {
        //jump
        slide = true
      } else if (keyEvent.key === 'a' || keyEvent.key === 'ArrowLeft') {
        // move left
        moveLeft = true
      } else if (keyEvent.key === 'd' || keyEvent.key === 'ArrowRight') {
        // move right
        moveRight = true
      } else if (keyEvent.key === '`') {
        cannonDebugger(scene, world.bodies)
        sideview = true
      }
    }
  }

  const move = (direction) => {
    if (start) {
      switch (direction) {
        case 'left':
          // Move character to the left
          moveLeft = true;
          break;
        case 'right':
          // Move character to the right
          moveRight = true;
          break;
        case 'slide':
          // Slide character
          slide = true;
          break;
        case 'jump':
          // Character jumps
          jump = true;
          break;
        default:
        // Other cases or default behavior
      }
    }
  }

  const interpolateColor = (color1, color2, factor) => {
    let result = color1.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
  };

  const getDynamicGradient = (score) => {
    // Change here: Incrementally increase 'factor' over the range of scores.
    let factor = Math.min(Math.floor(score / 15) / (256 / 3), 1); // The division by (256/15) is a scaling factor

    const newStartColor = interpolateColor(startColor, sunsetStartColor, factor);
    const newEndColor = interpolateColor(endColor, sunsetEndColor, factor);

    return `linear-gradient(to top, ${newStartColor} 15%, ${newEndColor} 100%)`;
  };

  const updateSunMaterialColor = () => {
    // Starting color (warm amber)
    const redColor = new THREE.Color(0xff0000);

    // Factor to control the speed of color transition (value between 0 and 1)
    const lerpFactor = 0.005;
    if (sunMesh.position.y < -4) {
      scene.remove(sunMesh)
    } else {
      sunMesh.position.y -= lerpFactor * 3
    }
    scene.fog.color.lerp(redColor, lerpFactor);// This will change the color to red
    // Gradually change the sun's color towards red
    // sunMaterial.color.lerp(redColor, lerpFactor);// This will change the color to red
  };

  document.onkeydown = handleKeyDown

  // Mobile Input

  gesture.on(
    'panleft panright panup swipedown tap press',
    debounce(
      function (ev) {
        if (!gameover && mobile && start && !buttons) {
          if (ev.type === 'tap') {
            jump = true
          }
          if (ev.type === 'panleft') {
            moveLeft = true
          }
          if (ev.type === 'panright') {
            moveRight = true
          }
          if (ev.type === 'swipedown') {
            slide = true
          }
        }
      },
      150,
      true
    )
  )

  /**
   * Utils
   */

  function debounce(func, wait, immediate) {
    var timeout
    return function () {
      var context = this,
        args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      timeouts.push(timeout)
      if (callNow) func.apply(context, args)
    }
  }

  let lastAnim

  function blendAnim(anim, transitionTime = 0.25) {
    anim.time = 0.0
    anim.enabled = true
    anim.setEffectiveTimeScale(1.0)
    anim.setEffectiveWeight(1.0)
    anim.reset()
    lastAnim && anim.crossFadeFrom(lastAnim, transitionTime, true)
    anim.play()
    lastAnim = anim
  }

  function startGame() {
    blendAnim(idleAnim)
    character.position.set(0, 0, 0)
    characterBody.wakeUp()
    characterBody.position.set(0, 0, 0)
    camera.aspect = window.innerWidth / (window.innerHeight)
    camera.updateProjectionMatrix()
    //timeouts.forEach(timeoutID => clearTimeout(timeoutID));
    timeouts = []; // Reset the array

    document.getElementById('score').innerText = 'Ready';

    const timeout1 = setTimeout(() => {
      if (document.getElementById('score')) {
        document.getElementById('score').innerText = 'Set';
      }
      const timeout2 = setTimeout(() => {
        if (document.getElementById('score')) {
          document.getElementById('score').innerText = 'Go!';
        }
        const timeout3 = setTimeout(() => {
          start = true;
          if (document.getElementById('top-bar')) {
            document.getElementById('top-bar').style.visibility = 'visible';
          }
          if(document.getElementById('tr-coin')){
            document.getElementById('tr-coin').style.visibility = 'visible'
          }
          if (document.getElementById('score')) {
            document.getElementById('score').innerText = '000';
          }
          blendAnim(runAnim);
        }, 1000);
        timeouts.push(timeout3);
      }, 1000);
      timeouts.push(timeout2);
    }, 1000);
    timeouts.push(timeout1);
  }

  function endGame() {
    //gameover = true
    //characterBody.sleep()
    if (!stumbleStarted) {
      blendAnim(stumbleAnim);
      setUserScore(score)
      stumbleStarted = true;
      // Here, updatedUserData is the response from your API call, containing the new coins amount
      const updatedPowerups = userData.boosts.map(boost => {
        if (boost.name === "wings") {
          return { ...boost, amount: wingsCount };
        }
        if (boost.name === "rainbow") {
          return { ...boost, amount: rainbowCount };
        }
        if (boost.name === "special") {
          return { ...boost, amount: specialCount };
        }
        return boost;
      })
      const distance = Math.round(characterBody.position.z)
      const settings = [{ name: "buttons", value: buttons }, { name: "cameraMoves", value: cameraMoves }]
      const totalCoins = userData.coins + score
      setTotalCoins(webApp, totalCoins)
      setBoosts(webApp, updatedPowerups)

      axios.post('http://157.230.109.1:8888/api/v1/user/userScore', {
        distance: distance,
        coins: totalCoins
      }, {
        headers: {
          Authorization: `Bearer ${authJWT}`
        }
      })
      .then(response => {
        // Handle the response from setting max distance, if needed
        // console.log('resp', response.data); // Assuming you want to log or do something with the response data
        setLastTimestamp(webApp, response.data.timestamp)
        if (distance > userData.maxDistance) {
          setMaxDistance(webApp, distance)
          setUserData({ ...userData, coins: totalCoins, boosts: updatedPowerups, settings: settings, maxDistance: distance, totalDistance: userData.totalDistance + distance, lastTimestamp: response.data.timestamp });
        } else {
          setUserData({ ...userData, coins: totalCoins, boosts: updatedPowerups, settings: settings, totalDistance: userData.totalDistance + distance, lastTimestamp: response.data.timestamp});
        }
    
        // ... Continue with the rest of your code
      })
      .catch(error => {
        console.error("Failed to update max distance and coins:", error);
      });

      setUserSettings(webApp, settings)
      // // Set a timeout of 3 seconds before triggering navigate
      setTimeout(() => {
        destroyGame()

      }, 2500);
    }
  }

  function collectCoin(bodyId) {
    // Remove clone from the scene
    coinsToRemove.push(bodyId)
  }


  function followPlayer(now) {
    if (character && start) {
      // aj
      if (chosenChar.name === 'runner') {
        leftFoot = character.children[0].children[0].children[2].children[0].children[0]
        rightFoot = character.children[0].children[0].children[1].children[0].children[0]
      } else {
        // boss & gran
        leftFoot = character.children[0].children[0].children[1].children[0].children[0]
        rightFoot = character.children[0].children[0].children[2].children[0].children[0]
      }

      const leftFootPosition = leftFoot.getWorldPosition(leftFootTarget)
      const rightFootPosition = rightFoot.getWorldPosition(rightFootTarget)

      character.updateMatrix()
      leftFoot.updateMatrix()
      rightFoot.updateMatrix()

      leftFootBody.position.set(
        leftFootPosition.x,
        wingsStatusTime > 0 ? 4 : leftFootPosition.y + 0.05,
        leftFootPosition.z
      )

      rightFootBody.position.set(
        rightFootPosition.x,
        rightFootPosition.y + 0.05,
        rightFootPosition.z
      )

      characterBody.velocity.z = pinkStatusTime === 0 ? characterSpeed + score / 30 : 12
      character.position.x = characterBody.position.x
      character.position.y = characterBody.position.y - 0.25

      groundPlane.position.z = characterBody.position.z
      stripe1.position.z = characterBody.position.z
      stripe2.position.z = characterBody.position.z

      if (inSlide) {
        character.position.z += 0.05
      } else {
        character.position.z = characterBody.position.z
      }

      if (wingsStatusTime > 0) {
        character.position.y = 4
        characterBody.position.y = 4
        camera.position.y = 6.5
      } else {
        camera.position.y = 3.5
      }
      camera.position.z = characterBody.position.z - distanceBehindPlayer
      camera.position.x = cameraMoves ? characterBody.position.x : 0
      sunMesh.position.z = characterBody.position.z + 30
      directionalLight.position.z = characterBody.position.z + 40
      directionalLight.target = character


      // Spawn obstacles
      if (!last || now - last >= 1 * 4500) {
        last = now
        const placement = Math.random()
        const randomItems = obstaclePlacements[Math.floor(Math.random() * 3)]
        if (pinkStatusTime === 0 && wingsStatusTime === 0) {
          if (placement < 0.33) {
            createRedObstacle(randomItems[0])
            createRedObstacle(randomItems[1])
          } else if (placement < 0.66){
            createZloyObstacle(randomItems[0])
            createZloyObstacle(randomItems[1])
          } else {
            createSmallObstacle(randomItems[0])
            createSmallObstacle(randomItems[1])
          }
        }
      }


      // Spawn coins
      if (!lastCoin || now - lastCoin >= 1 * 2000) {
        lastCoin = now
        if (pinkStatusTime !== 0) {
          pinkStatusTime--
          if (pinkStatusTime === 0) {
            const baseMaterial = chosenChar.name === 'runner' ? boyMaterial :
              chosenChar.name === 'robot' ? robotMaterial :
                chosenChar.name === 'cok' ? cokMaterial :
                chosenChar.name === 'zai' ? zaiMaterial :
                chosenChar.name === 'coolman' ? coolmanMaterial :
                chosenChar.name === 'trap' ? trapMaterial : granMaterial
            character.traverse((child) => {
              child.material = baseMaterial
              child.castShadow = true
            })
          }

        }
        if (wingsStatusTime !== 0) {
          //blendAnim(flyAnim)
          wingsStatusTime--
          if (wingsStatusTime === 0) {
            character.position.y = 0
            characterBody.position.y = 0
            leftFootBody.position.y = 0
            fly = false
            blendAnim(runAnim)
          }

        }

        if (specialStatusTime !== 0) {
          //blendAnim(flyAnim)
          specialStatusTime--
          if (specialStatusTime === 0) {
            document.getElementById('left-scoreboard').style.color = ''
            coin.traverse((child) => {
              child.material = coinMaterial
              child.castShadow = true
            })
          }
        }

        // Call the randomly selected method
        const reward = Math.random()
        if (reward < 0.01 && pinkStatusTime === 0 && wingsStatusTime === 0 && specialStatusTime === 0) {
          createRainbow(getPlacement())
        } else if (reward >= 0.01 && reward < 0.02 && pinkStatusTime === 0 && wingsStatusTime === 0 && specialStatusTime === 0) {
          createWings(getPlacement())
        } else if (reward >= 0.02 && reward < 0.03 && pinkStatusTime === 0 && wingsStatusTime === 0 && specialStatusTime === 0) {
          createSpecialCoin(getPlacement())
        } else {
          const randomIndex = Math.floor(Math.random() * coinCreationMethods.length);
          coinCreationMethods[randomIndex]();
        }
      }

      // Spawn walls
      if (!lastCrystal || now - lastCrystal >= 1 * 500) {
        lastCrystal = now
        const randomIndex = Math.floor(Math.random() * crystalCreationMethods.length);

        // Call the randomly selected method
        crystalCreationMethods[randomIndex]();
      }
    }
  }

  function destroyGame() {
    gameover = true
    start = false

    objectsToUpdate.forEach((object, index) => {
      scene.remove(object.clone)
      if (object.clone.geometry) {
        object.clone.geometry.dispose();
      }
      if (object.clone.material) {
        if (object.clone.material.map) {
          object.clone.material.map.dispose();
        }
        if (Array.isArray(object.clone.material)) {
          object.clone.material.forEach(material => material.dispose());
        } else {
          object.clone.material.dispose();
        }
      }
      
      world.removeBody(object.body);
    })
    if (directionalLight) {
      directionalLight.shadow.map?.dispose();
    }
    if (camera) scene.remove(camera);
    if (directionalLight) scene.remove(directionalLight);
    window.removeEventListener('resize', resizeListener);
    THREE.Cache.clear();
    columnsToUpdate.forEach((object, index) => {
      scene.remove(object.clone)
    })
    columnsToUpdate = []
    objectsToUpdate = []
    while(scene.children.length > 0){ 
      scene.remove(scene.children[0]); 
    }
    if (renderer) {
      renderer.forceContextLoss();
      renderer.domElement = null;
    }
    if (mixer) {
      mixer.stopAllAction();
      mixer.uncacheRoot(mixer.getRoot());
    }
    renderer.dispose();
    if (timeouts && timeouts.length) {
      timeouts.forEach(timeoutID => clearTimeout(timeoutID));
      timeouts = [];

    }
    navigate('/')
  }

  const useWings = () => {
    if (wingsCount > 0) {
      createWings(getPlacement())
      wingsCount = wingsCount - 1
      document.getElementById('wingsCount').innerText = String("🦋" + wingsCount)
      // Your code to handle wings usage
    }
  };

  const useSpecial = () => {
    if (specialCount > 0) {
      createSpecialCoin(getPlacement())
      specialCount = specialCount - 1
      document.getElementById('specialCount').innerText = String("🪙" + specialCount)
      // Your code to handle special usage
    }
  };

  const useRainbow = () => {
    if (rainbowCount > 0) {
      createRainbow(getPlacement())
      rainbowCount = rainbowCount - 1
      document.getElementById('rainbowCount').innerText = String("🌈" + rainbowCount)
    }
  };

  const useButtons = () => {
    buttons = !buttons
    document.getElementById('bottom-bar').style.visibility = buttons ? 'visible' : 'hidden'
    document.getElementById('buttons').style.backgroundColor = buttons ? '#bacbff' : '#6570b2'
  }

  const useCamera = () => {
    cameraMoves = !cameraMoves
    document.getElementById('cameraMoves').style.backgroundColor = cameraMoves ? '#bacbff' : '#6570b2'
  }

  return (
    <div>
      <canvas className="webgl"></canvas>
      <div id="loading-screen">
        <div className="loading-container">
          <div className="progress-bar-container">
            <div id="progress-bar"></div>
          </div>
        </div>
      </div>
      <div className="scoreboard" id="left-scoreboard">
      <div className="score-container">
        <div className="score" id="score">000</div>
        <img className="tr-coin" id="tr-coin" src={trCoin} alt="Coin Logo" />
      </div>
      </div>
      <div className="scoreboard" id="right-scoreboard">
        <div className="score" id="distance">000</div>
      </div>
      <div className="top-bar" id="top-bar">
        <button className="consumable-button" id="buttons" onClick={useButtons}>
          🅱️
        </button>
        <button className="consumable-button" id="cameraMoves" onClick={useCamera}>
          🎥
        </button>
      </div>

      <div className="left-bar">
        <button className="consumable-button" id="rainbowCount" onClick={useRainbow}>
          🌈:0
        </button>
        <button className="consumable-button" id="specialCount" onClick={useSpecial}>
          🪙:0
        </button>
        <button className="consumable-button" id="wingsCount" onClick={useWings}>
          🦋:0
        </button>
      </div>
      <div className="bottom-bar" id="bottom-bar">
        <div className="controls-container">
          <div className="left-control">
            <button className="control-button" onClick={() => move('left')}>Left</button>
          </div>
          <div className="center-controls">
            <button className="control-button jump-button" onClick={() => move('jump')}>Jump</button>
            <button className="control-button slide-button" onClick={() => move('slide')}>Slide</button>
          </div>
          <div className="right-control">
            <button className="control-button" onClick={() => move('right')}>Right</button>
          </div>
        </div>
        {/* <div className="byline">
          <button className="btn remove" onClick={destroyGame}>Back to Menu</button>
        </div> */}
      </div>
    </div>
  )
}

export default ThreeJsGame
