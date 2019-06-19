const searchBlock = document.querySelector('.search');
const searchInput = searchBlock.querySelector('.search__input');
const cache = {};
const tagContainer = document.querySelector('.search__tags');
const buttonClear = document.querySelector('.search__button-clear');
const resultTitle = document.querySelector('.result__title');
const results = document.querySelector('.result__cards');
const loader = document.querySelector('.loader-wrapper');

buttonClear.addEventListener('click', function () {
    searchInput.value = '';
});

function addTag(value) {
    let tags = [...tagContainer.querySelectorAll('.tag')].map(p => p.textContent);

    if (tags.includes(value)) {
        return;
    }

    let tag = document.createElement('div');
    tag.classList.add('tag');
    tag.innerHTML = value;
    tagContainer.insertBefore(tag, tagContainer.firstChild);

    tags.push(value);
    localStorage.setItem("tags", tags);


    tag.addEventListener('click', async function(e) {
        if (e.altKey) {
            tag.remove(e.target);

            if (!localStorage.getItem("tags").length) {
                localStorage.removeItem("tags");
                return;
            }

            tags.splice(tags.indexOf(e.target.textContent), 1);
            localStorage.setItem("tags", tags);

            let tagsStorage = localStorage.getItem("tags");

            if (!tagsStorage.length) {
                localStorage.setItem("tags", tags);
            }
            return;
        } 
        searchInput.value = e.target.textContent;
        localStorage.setItem("query", e.target.textContent);
        const item = await load(e.target.textContent);

        render(item);
    });

    return tagContainer;
}

searchInput.onfocus = () => searchBlock.classList.add('search--focused');


async function load(query) {
    let _query = query.toLowerCase();

    if (cache[_query]) {
        renderTitle(cache[_query]);
        return cache[_query];
    }

    try {
        resultTitle.style.display = 'none';
        results.style.display = 'none';
        loader.style.display = 'flex';

        const data = await fetch(`http://www.omdbapi.com/?type=movie&apikey=7ea4aa35&s=${query}`)
                        .then((response) => response.json());

        cache[_query] = data;

        renderTitle(data);

        loader.style.display = 'none';
        resultTitle.style.display = 'block';
        results.style.display = 'flex';

        return data;

    } catch (error) {
        alert(error);
    }
}

function render(data) {
    let html = '';
    let items = data.Search;
    
    if (!items || !items.length) {
        return;
    }

    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        html += renderItem(item);
    }

    results.innerHTML = html;
}

function renderTitle(data) {
    resultTitle.textContent = '';
    if (data.Response === 'True') {
        resultTitle.textContent = `Нашли ${data.totalResults} фильма`;
        
    } else {
        resultTitle.textContent = `Мы не поняли о чем речь ¯\\_(ツ)_/¯`;
    }
      
}

function renderItem(item) {
    return `<div class="card ${item.Poster === 'N/A' ? 'card--no-photo' : ''}">
    <img src="${item.Poster}" alt="" width="100%" height="100%">
    <div class="card__wrapper">
        <div class="card__rating">
            <img class="icon" src="images/r03@2x.png" alt="" width="30px" height="30px">
            <div class="value"></div>
        </div>
        <div class="card__title">${item.Title}</div>
        <div class="gray-text">
            <div class="card__genre">${item.Genre}</div>
            <div class="card__year">${item.Year}</div>
        </div>
    </div>
    </div>`;
}

function debounce(f, ms) {

    let timer = null;
  
    return function (...args) {
      const onComplete = () => {
        f.apply(this, args);
        timer = null;
      }
  
      if (timer) {
        clearTimeout(timer);
      }
  
      timer = setTimeout(onComplete, ms);
    };
}



window.onload = async () => {
    let previousQuery = localStorage.getItem("query");
    if (previousQuery && previousQuery.length) {
        const item = await load(previousQuery);

        render(item);

        searchInput.value = previousQuery;
        searchBlock.classList.add('search--focused');
    }

    loader.style.display = 'none';

    let tags = localStorage.getItem("tags");
    
    if (tags !== undefined && tags !== null) {
        let tagsArr = tags.split(',');
        for (let i = 0; i < tagsArr.length; i++) {
            addTag(tagsArr[i]);
        }
    }

    searchInput.oninput = debounce(async function (e) {

        if (e.target.value.length < 3) {
            return;
        }

        const item = await load(e.target.value);
        render(item);
        addTag(e.target.value);

        localStorage.setItem("query", e.target.value);
 
    }, 1000);
};

