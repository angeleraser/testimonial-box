const testimonialSection = document.getElementById("testimonial-section");
const quoteText = document.getElementById("quote-text");
const quoteAuthorImg = document.getElementById("quote-author-img");
const quoteAuthorName = document.getElementById("quote-author-name");
const quoteAuthorPosition = document.getElementById("quote-author-position");

class ProgressBarComponent {
  constructor({
    durationMs = 5000,
    height = "4px",
    loop = false,
    intervalMs = 100,
    onStart,
    onComplete,
  }) {
    this.durationMs = durationMs;
    this.$root = this.createRoot({ height });
    this.loop = loop;
    this.intervalMs = intervalMs;
    this.onComplete = onComplete;
    this.onStart = onStart;
    this.start();
  }

  createRoot({ height }) {
    const root = document.createElement("div");
    root.classList.add("progress-bar");

    const fill = document.createElement("div");
    fill.classList.add("progress-bar-fill");

    root.style.setProperty("--pb-height", height);

    root.append(fill);

    return root;
  }

  start() {
    const duration = this.loop ? Infinity : this.durationMs;
    const interval = this.durationMs / 100;
    let elapsedTime = 0;

    this.onStart();

    timer({
      durationMs: duration,
      intervalMs: interval,
      callback: () => {
        if (elapsedTime > this.durationMs) {
          elapsedTime = 0;
          this.setFillValue(100);
          this.onComplete?.();
        }

        this.setFillValue((elapsedTime * 100) / this.durationMs);
        elapsedTime += interval;
      },
    });
  }

  setFillValue(percentage = 0) {
    this.$root.querySelector(
      ".progress-bar-fill"
    ).style.width = `${percentage}%`;
  }
}

function timer({ durationMs, callback, intervalMs = 100 }) {
  let totalMs = 0;
  const interval = setInterval(() => {
    callback?.();
    totalMs += intervalMs;
    if (totalMs >= durationMs) {
      clearInterval(interval);
      callback?.();
    }
  }, intervalMs);
  return interval;
}

function renderQuoteHTML({ text, authorImgSrc, authorName, authorPosition }) {
  quoteText.textContent = text;
  quoteAuthorImg.src = authorImgSrc;
  quoteAuthorName.textContent = authorName;
  quoteAuthorPosition.textContent = authorPosition;
}

/**
 * @see https://github.com/lukePeavey/quotable
 */
async function getRandomQuotes(count = 1) {
  const resp = await fetch(
    `https://api.quotable.io/quotes/random?limit=${count}`
  );
  const data = await resp.json();
  return data.map((quote) => quote.content);
}

/**
 * @see https://randomuser.me/
 */
async function getRandomUsers(count = 1) {
  const positions = [
    "Marketing",
    "Software Engineer",
    "Data Entry",
    "Graphic Designer",
    "Accountant",
    "Director",
  ];

  const resp = await fetch(`https://randomuser.me/api?results=${count}`);
  const { results } = await resp.json();

  return results.map((user) => {
    return {
      imgSrc: user.picture.thumbnail,
      fullname: `${user.name.first} ${user.name.last}`,
      position: positions[Math.floor(Math.random() * positions.length)],
    };
  });
}

async function getUsersTestimony(count = 1) {
  const quotes = await getRandomQuotes(count);
  const users = await getRandomUsers(count);

  return users.map((user, index) => {
    return {
      user,
      testimony: quotes[index],
    };
  });
}

const TESTIMONY_DURATION = 10000;
const TESTIMONIES_COUNT = 5;

getUsersTestimony(TESTIMONIES_COUNT).then((testimonies) => {
  let index = 0;

  function showTestimony() {
    const item = testimonies[index];

    renderQuoteHTML({
      text: item.testimony,
      authorImgSrc: item.user.imgSrc,
      authorName: item.user.fullname,
      authorPosition: item.user.position,
    });

    index = index === testimonies.length - 1 ? 0 : ++index;
  }

  const ProgressBar = new ProgressBarComponent({
    height: "4px",
    durationMs: TESTIMONY_DURATION,
    loop: true,
    onStart: showTestimony,
    onComplete: showTestimony,
  });

  testimonialSection.prepend(ProgressBar.$root);
});