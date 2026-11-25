(() => {
  "use strict";

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const stages = $$(".stage");

  let current = 0;
  let musicStarted = false;
  let birthdayMusic = null;
  let bakeTimer = null;

  let micStream = null;
  let micRAF = null;

  const messages = [
    "Gathering the sweetest ingredients...",
    "Mixing a little happiness...",
    "Adding extra layers of sweetness...",
    "Decorating with lots of love...",
    "Almost ready!"
  ];

  /*
   * ============================================================
   * BIRTHDAY MUSIC
   * ============================================================
   *
   * Put your music file here:
   *
   * assets/music/birthday.mp3
   *
   * The music starts after the user clicks
   * "Open Your Surprise ✨".
   */

  function startMusic() {
    if (musicStarted) return;

    musicStarted = true;

    try {
      birthdayMusic = new Audio("assets/music/birthday.mp3");

      birthdayMusic.loop = true;
      birthdayMusic.volume = 0.35;
      birthdayMusic.preload = "auto";

      const playPromise = birthdayMusic.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          /*
           * Some mobile browsers may block autoplay.
           * Music is intentionally non-blocking.
           */
          musicStarted = false;
        });
      }
    } catch (e) {
      musicStarted = false;
    }
  }

  function stopMusic() {
    if (!birthdayMusic) return;

    try {
      birthdayMusic.pause();
      birthdayMusic.currentTime = 0;
    } catch (e) {}

    birthdayMusic = null;
    musicStarted = false;
  }

  function setStage(index, dir = 1) {
    index = Math.max(0, Math.min(stages.length - 1, index));

    stages.forEach((s, i) => {
      s.classList.toggle("active", i === index);
    });

    current = index;

    $("#backBtn").disabled = index === 0;

    $("#stageDots").innerHTML = stages
      .map(
        (_, i) =>
          `<i class="dot ${i === index ? "active" : ""}"></i>`
      )
      .join("");

    $("#stageDots").style.display =
      index === 0 || index === stages.length - 1
        ? "none"
        : "flex";

    $(".stage-nav").classList.toggle(
      "visible",
      index > 0 && index < stages.length - 1
    );

    window.scrollTo(0, 0);
  }

  function next() {
    setStage(current + 1, 1);
  }

  function back() {
    setStage(current - 1, -1);
  }

  $("#backBtn").addEventListener("click", back);

  /*
   * ============================================================
   * EFFECTS
   * ============================================================
   */

  function burst(count = 28) {
    const fx = $("#effects");

    for (let i = 0; i < count; i++) {
      const e = document.createElement("span");

      e.className = "confetti";

      e.style.left = 45 + Math.random() * 10 + "%";
      e.style.top = 20 + Math.random() * 15 + "%";

      e.style.background = [
        "#e7a9bd",
        "#c9b8e8",
        "#f2c38f",
        "#f5dca4",
        "#fff0e9"
      ][i % 5];

      e.style.setProperty(
        "--dx",
        (Math.random() - 0.5) * 80 + "vw"
      );

      e.style.animationDelay =
        Math.random() * 0.18 + "s";

      fx.appendChild(e);

      setTimeout(() => e.remove(), 2200);
    }
  }

  function hearts(count = 14) {
    const fx = $("#effects");

    for (let i = 0; i < count; i++) {
      const e = document.createElement("span");

      e.className = "heart-fx";
      e.textContent = Math.random() > 0.5 ? "♡" : "✦";

      e.style.left = 15 + Math.random() * 70 + "%";
      e.style.top = 55 + Math.random() * 15 + "%";

      e.style.setProperty(
        "--dx",
        (Math.random() - 0.5) * 160 + "px"
      );

      fx.appendChild(e);

      setTimeout(() => e.remove(), 1900);
    }
  }

  function sparkles(count = 12) {
    const fx = $("#effects");

    for (let i = 0; i < count; i++) {
      const e = document.createElement("span");

      e.className = "spark-fx";
      e.textContent = "✦";

      e.style.left = 35 + Math.random() * 30 + "%";
      e.style.top = 35 + Math.random() * 25 + "%";

      e.style.setProperty(
        "--dx",
        (Math.random() - 0.5) * 180 + "px"
      );

      e.style.setProperty(
        "--dy",
        (Math.random() - 0.5) * 180 + "px"
      );

      fx.appendChild(e);

      setTimeout(() => e.remove(), 1100);
    }
  }

  /*
   * ============================================================
   * WELCOME
   * ============================================================
   */

  $("#openSurprise").addEventListener("click", () => {
    startMusic();

    burst(36);
    sparkles(16);

    $("#welcomeGift").classList.add("opening");

    setTimeout(() => {
      setStage(1);
    }, 700);
  });

  /*
   * ============================================================
   * DECORATION → BAKING
   * ============================================================
   */

  $("#decorNext").addEventListener("click", () => {
    setStage(2);
    startBaking();
  });

  function startBaking() {
    clearInterval(bakeTimer);

    let p = 0;
    let msg = 0;

    $("#bakeProgress").style.width = "0%";
    $("#progressText").textContent = "0%";
    $("#bakeMessage").textContent = messages[0];

    bakeTimer = setInterval(() => {
      p += 2;

      if (p % 20 === 0 && msg < messages.length - 1) {
        msg++;
        $("#bakeMessage").textContent = messages[msg];
      }

      $("#bakeProgress").style.width = p + "%";
      $("#progressText").textContent = p + "%";

      if (p >= 100) {
        clearInterval(bakeTimer);

        setTimeout(() => {
          sparkles(22);
          setStage(3);
        }, 650);
      }
    }, 95);
  }

  /*
   * ============================================================
   * CAKE REVEAL
   * ============================================================
   */

  $("#cakeContinue").addEventListener("click", () => {
    setStage(4);
  });

  /*
   * ============================================================
   * CANDLES
   * ============================================================
   */

  let candlesLit = false;
  let candlesDone = false;

  $("#lightCandles").addEventListener("click", () => {
    candlesLit = true;

    $(".interactive-cake").classList.add("candles-lit");

    $("#lightCandles").classList.add("hidden");

    $("#micBlow").classList.remove("hidden");
    $("#manualBlow").classList.remove("hidden");

    $("#microHelp").classList.remove("hidden");

    $("#wishInstruction").textContent =
      "Close your eyes, make a beautiful wish!";
  });

  $("#manualBlow").addEventListener("click", () => {
    extinguishCandles("manual");
  });

  $("#micBlow").addEventListener("click", startMic);

  /*
   * ============================================================
   * MICROPHONE BLOW DETECTION
   * ============================================================
   */

  async function startMic() {
    if (!candlesLit || candlesDone) return;

    $("#listenStatus").textContent =
      "Calibrating the microphone… stay quiet for a moment.";

    $("#micBlow").disabled = true;

    let micAudioContext = null;

    try {
      if (
        !window.isSecureContext &&
        location.hostname !== "localhost" &&
        location.hostname !== "127.0.0.1"
      ) {
        throw new Error("insecure");
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("unsupported");
      }

      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          channelCount: 1
        }
      });

      micAudioContext =
        new (window.AudioContext ||
          window.webkitAudioContext)();

      if (micAudioContext.state === "suspended") {
        await micAudioContext.resume();
      }

      const src =
        micAudioContext.createMediaStreamSource(
          micStream
        );

      const analyser =
        micAudioContext.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.35;

      src.connect(analyser);

      const data = new Float32Array(
        analyser.fftSize
      );

      let samples = 0;
      let noiseSum = 0;
      let noiseFloor = 0.012;

      let burstStart = 0;
      let lastStrong = 0;

      const started = performance.now();

      $("#listenStatus").textContent =
        "Listening… now blow gently towards your microphone.";

      const tick = () => {
        analyser.getFloatTimeDomainData(data);

        let sum = 0;
        let crossings = 0;
        let prev = data[0];

        for (let i = 0; i < data.length; i++) {
          const v = data[i];

          sum += v * v;

          if ((v >= 0) !== (prev >= 0)) {
            crossings++;
          }

          prev = v;
        }

        const rms = Math.sqrt(
          sum / data.length
        );

        const zcr =
          crossings / data.length;

        const now = performance.now();

        /*
         * First 900ms establishes the ambient
         * microphone noise floor.
         */

        if (now - started < 900) {
          noiseSum += rms;
          samples++;

          noiseFloor = Math.max(
            0.008,
            noiseSum / samples
          );
        }

        const adaptive = Math.max(
          noiseFloor * 2.8,
          0.028
        );

        const broadbandBlow =
          rms > adaptive &&
          zcr > 0.035;

        if (broadbandBlow) {
          if (!burstStart) {
            burstStart = now;
          }

          lastStrong = now;

          /*
           * Require a sustained breath-like burst.
           */

          if (now - burstStart >= 220) {
            cleanupMic(micAudioContext);
            extinguishCandles("mic");
            return;
          }
        } else if (
          lastStrong &&
          now - lastStrong > 140
        ) {
          burstStart = 0;
        }

        if (now - started > 13000) {
          cleanupMic(micAudioContext);

          $("#listenStatus").textContent =
            "I couldn't hear a clear blow. Try again or use the manual button.";

          $("#micBlow").disabled = false;

          return;
        }

        micRAF =
          requestAnimationFrame(tick);
      };

      tick();

    } catch (e) {
      cleanupMic(micAudioContext);

      let msg =
        "Microphone isn't available here — manual extinguishing is ready.";

      if (e.name === "NotAllowedError") {
        msg =
          "Microphone permission was declined — manual extinguishing is ready.";
      }

      if (e.message === "insecure") {
        msg =
          "Microphone needs a secure page. On localhost it should work; manual extinguishing is always available.";
      }

      $("#listenStatus").textContent = msg;

      $("#micBlow").disabled = false;
    }
  }

  function cleanupMic(ctx) {
    if (micRAF) {
      cancelAnimationFrame(micRAF);
      micRAF = null;
    }

    if (micStream) {
      micStream
        .getTracks()
        .forEach(track => track.stop());

      micStream = null;
    }

    try {
      ctx?.close();
    } catch (e) {}
  }

  /*
   * ============================================================
   * EXTINGUISH CANDLES
   * ============================================================
   */

  function extinguishCandles() {
    if (candlesDone) return;

    candlesDone = true;

    cleanupMic();

    $(".interactive-cake").classList.remove(
      "candles-lit"
    );

    $(".interactive-cake").classList.add(
      "candles-out"
    );

    $("#micBlow").classList.add("hidden");
    $("#manualBlow").classList.add("hidden");
    $("#microHelp").classList.add("hidden");

    $("#listenStatus").textContent = "";

    $("#wishCelebration").classList.remove(
      "hidden"
    );

    burst(45);
    hearts(20);
    sparkles(25);
  }

  /*
   * ============================================================
   * CUT THE CAKE
   * ============================================================
   */

  $("#cutCake").addEventListener("click", () => {
    setStage(5);
  });

  $("#cutAction").addEventListener("click", () => {
    $("#cutCakeArt").classList.add("cut-done");

    $("#cutAction").classList.add("hidden");

    $("#cutMessage").classList.remove("hidden");

    $("#toGifts").classList.remove("hidden");

    burst(18);
  });

  $("#toGifts").addEventListener("click", () => {
    setStage(6);
  });

  /*
   * ============================================================
   * GIFTS
   * ============================================================
   */

  let openedGifts = 0;

  $$(".gift-card").forEach(card => {
    card
      .querySelector(".gift-open")
      .addEventListener("click", () => {
        const wasOpen =
          card.classList.contains("open");

        card.classList.toggle("open");

        if (!wasOpen) {
          openedGifts++;

          sparkles(8);
          hearts(5);
        }

        card.querySelector(".gift-open").textContent =
          card.classList.contains("open")
            ? "Close ♡"
            : "Open ♡";

        if (openedGifts >= 4) {
          $("#giftsNext").classList.remove(
            "hidden"
          );
        }
      });
  });

  $("#giftsNext").addEventListener("click", () => {
    setStage(7);
  });

  /*
   * ============================================================
   * LETTER
   * ============================================================
   */

  $("#openLetter").addEventListener("click", () => {
    $("#openLetter").classList.add("open");

    $("#letterOverlay").classList.add("open");

    $("#letterOverlay").setAttribute(
      "aria-hidden",
      "false"
    );

    typeLetter();
  });

  $("#closeLetter").addEventListener(
    "click",
    closeLetter
  );

  $("#letterSkip").addEventListener(
    "click",
    () => setStage(8)
  );

  function closeLetter() {
    $("#letterOverlay").classList.remove("open");

    $("#letterOverlay").setAttribute(
      "aria-hidden",
      "true"
    );

    setStage(8);
  }

  const letterText =
    "I don't know how to put into words just how special you are, but I hope this little message makes you smile. Your existence makes the world a little brighter, and I hope you never forget that. May this year bring you everything you've been quietly wishing for, unexpected laughter, beautiful moments, and people who make you feel at home. Keep dreaming, keep smiling, and never lose those little things that make you who you are. I hope you get a thousand reasons to be happy, not just today but on all the ordinary days too. You deserve all the happiness in the world. Happy Birthday! ♡  ♡"
  let typingTimer;

  function typeLetter() {
    clearInterval(typingTimer);

    $("#typedLetter").textContent = "";

    let i = 0;

    typingTimer = setInterval(() => {
      if (i < letterText.length) {
        $("#typedLetter").textContent +=
          letterText[i++];

      } else {
        clearInterval(typingTimer);
      }
    }, 24);
  }

  /*
   * ============================================================
   * EXTRA SURPRISES
   * ============================================================
   */

  $("#magicStar").addEventListener(
    "click",
    () => {
      $("#extraMessage").textContent =
        "A tiny wish for you: may something you secretly hope for surprise you in the sweetest way. ✨";

      sparkles(18);
    }
  );

  $("#bubblePop").addEventListener(
    "click",
    () => {
      $("#extraMessage").textContent =
        "Pop, pop, pop! Three tiny hearts for your day. ♡";

      for (let i = 0; i < 10; i++) {
        const b =
          document.createElement("span");

        b.className = "bubble";

        b.style.left =
          20 + Math.random() * 60 + "%";

        b.style.top = "65%";

        b.style.setProperty(
          "--dx",
          (Math.random() - 0.5) * 100 +
            "px"
        );

        $("#effects").appendChild(b);

        setTimeout(
          () => b.remove(),
          2100
        );
      }
    }
  );

  $("#catTap").addEventListener(
    "click",
    () => {
      $("#extraMessage").textContent =
        "Chef Cat says: the secret ingredient was always extra love. 🐱‍🍰";

      hearts(10);
    }
  );

  /*
   * ============================================================
   * FINALE
   * ============================================================
   */

  $("#finaleNext").addEventListener(
    "click",
    () => {
      setStage(9);

      burst(50);
      hearts(30);
      sparkles(30);
    }
  );

  /*
   * ============================================================
   * REPLAY
   * ============================================================
   */

  $("#replay").addEventListener(
    "click",
    () => {
      clearInterval(bakeTimer);

      cleanupMic();

      stopMusic();

      candlesLit = false;
      candlesDone = false;
      openedGifts = 0;

      $(".interactive-cake").classList.remove(
        "candles-lit",
        "candles-out"
      );

      $("#lightCandles").classList.remove(
        "hidden"
      );

      $("#micBlow").classList.add("hidden");
      $("#manualBlow").classList.add("hidden");
      $("#microHelp").classList.add("hidden");

      $("#wishCelebration").classList.add(
        "hidden"
      );

      $("#cutCakeArt").classList.remove(
        "cut-done"
      );

      $("#cutAction").classList.remove(
        "hidden"
      );

      $("#cutMessage").classList.add(
        "hidden"
      );

      $("#toGifts").classList.add(
        "hidden"
      );

      $$(".gift-card").forEach(card => {
        card.classList.remove("open");

        card.querySelector(
          ".gift-open"
        ).textContent = "Open ♡";
      });

      $("#giftsNext").classList.add(
        "hidden"
      );

      $("#letterOverlay").classList.remove(
        "open"
      );

      $("#letterOverlay").setAttribute(
        "aria-hidden",
        "true"
      );

      $("#openLetter").classList.remove(
        "open"
      );

      $("#bakeProgress").style.width =
        "0%";

      $("#progressText").textContent = "0%";

      $("#extraMessage").textContent =
        "Choose a tiny surprise above ✨";

      setStage(0);

      burst(20);
    }
  );

  /*
   * ============================================================
   * THREE.JS STARFIELD
   * ============================================================
   */

  (function initThree() {
    const canvas = $("#starfield");

    try {
      if (
        !window.THREE ||
        !window.WebGLRenderingContext
      ) {
        return;
      }

      const renderer =
        new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false
        });

      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio || 1,
          1.5
        )
      );

      const scene = new THREE.Scene();

      const camera =
        new THREE.PerspectiveCamera(
          60,
          innerWidth / innerHeight,
          1,
          1000
        );

      camera.position.z = 80;

      const geo =
        new THREE.BufferGeometry();

      const count = 130;

      const arr =
        new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        arr[i * 3] =
          (Math.random() - 0.5) * 120;

        arr[i * 3 + 1] =
          (Math.random() - 0.5) * 80;

        arr[i * 3 + 2] =
          (Math.random() - 0.5) * 100;
      }

      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(
          arr,
          3
        )
      );

      const mat =
        new THREE.PointsMaterial({
          color: 0xe4c8d5,
          size: 1.4,
          transparent: true,
          opacity: 0.7
        });

      const points =
        new THREE.Points(
          geo,
          mat
        );

      scene.add(points);

      function resize() {
        renderer.setSize(
          innerWidth,
          innerHeight,
          false
        );

        camera.aspect =
          innerWidth / innerHeight;

        camera.updateProjectionMatrix();
      }

      addEventListener(
        "resize",
        resize
      );

      resize();

      let last = 0;

      function frame(t) {
        if (t - last > 33) {
          points.rotation.y +=
            0.00035;

          points.rotation.x +=
            0.00012;

          renderer.render(
            scene,
            camera
          );

          last = t;
        }

        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);

    } catch (e) {
      canvas.style.display = "none";
    }
  })();

  /*
   * ============================================================
   * INITIAL STAGE
   * ============================================================
   */

  setStage(0);

})();
