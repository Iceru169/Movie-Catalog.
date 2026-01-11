const all = document.getElementById("all");
const pag = document.getElementById("pag");
const search = document.getElementById("search")
const genres = document.getElementById("genres")

const searchInput = document.getElementById("searchInp");
const yearInput = document.getElementById("yearInp");
const genreSelect = document.getElementById("genreSel");
const searchBtn = document.getElementById("searchBtn");
const ratingInput = document.getElementById("ratingInp");

let allMovies = [];

async function getMovies() {
    const res = await fetch("https://api.tvmaze.com/shows");
    if (res.ok) {
        const data = await res.json();
        allMovies = data; 
        
        fillGenres(allMovies);    
        initPagination(allMovies);
    }
}

function initPagination(data) {
    $('#pagination-container').pagination({
        dataSource: data,
        pageSize: 3,
        callback: function(dataOnPage) {
            viewData(dataOnPage);
        }
    });
}

function filterMovies() {
    const nameVal = searchInput.value.toLowerCase();
    const yearVal = yearInput.value;
    const genreVal = genreSelect.value;
    const ratingVal = ratingInput.value ? parseFloat(ratingInput.value) : 0;

    const filtered = allMovies.filter(movie => {
        const matchName = movie.name.toLowerCase().includes(nameVal);
        const matchYear = yearVal ? movie.premiered?.includes(yearVal) : true;
        const matchGenre = genreVal === "All" || movie.genres?.includes(genreVal);
        
        const movieRating = movie.rating?.average || 0;
        const matchRating = (ratingVal === 0) ? true : (movieRating >= ratingVal);

        return matchName && matchYear && matchGenre && matchRating;
    });

    $('#pagination-container').pagination('destroy'); 
    initPagination(filtered); 
}

function fillGenres(data) {
    const genreSelect = document.getElementById("genreSel");    
    genreSelect.innerHTML = '<option value="All">All Genres</option>';
    
    let allGenres = [];
    data.forEach(movie => {
        if (movie.genres) allGenres.push(...movie.genres);
    });

    const uniqueGenres = [...new Set(allGenres)];
    uniqueGenres.sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
}

searchBtn.addEventListener('click', filterMovies);

function viewData(data) {
    const all = document.getElementById("all");
    all.innerHTML = ""; 
    
    data.map((item) => {
        const cardCol = document.createElement("div");
        cardCol.className = "col-lg-4 col-md-6 col-sm-12 mb-4 d-flex justify-content-center";

        cardCol.innerHTML = `
            <div class="card h-100 shadow-sm" style="width: 100%; max-width: 350px;">
                <img src="${item.image?.medium}" class="card-img-top" style="height: 400px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold">${item.name}</h5>
                    <p class="mb-1 text-muted small">📆 ${item.premiered?.split('-')[0] || 'N/A'}</p>
                    <p class="text-warning small fw-bold">⭐ ${item.rating?.average || '0.0'}</p>
                    
                    <div class="d-flex justify-content-between mt-auto gap-1">
                        <a href="https://www.youtube.com/results?search_query=${item.name}+trailer" target="_blank" class="btn btn-outline-info btn-sm flex-fill">Trailer</a>
                        
                        <a href="${item.url}" target="_blank" class="btn btn-outline-primary btn-sm flex-fill">Info</a>
                        
                        <button class="btn btn-outline-success btn-sm" onclick="addToBookmarks(${item.id})">Bookmark</button>
                    </div>
                </div>
            </div>`;
        all.appendChild(cardCol);
    });
}

let bookmarks = [];

function addToBookmarks(id) {
    const movie = allMovies.find(m => m.id === id);
    
    if (movie && !bookmarks.some(b => b.id === id)) {
        bookmarks.push(movie);
        renderBookmarks();
    } else {
        alert("You've already saved this movie!");
    }
}

function renderBookmarks() {
    const list = document.getElementById("bookmarksList");
    list.innerHTML = "";
    
    if (bookmarks.length === 0) {
        list.innerHTML = '<li class="list-group-item text-muted">There are no saved movies in the list.</li>';
        return;
    }

    bookmarks.forEach(movie => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <span style="font-size: 0.9rem;">${movie.name}</span>
            <button class="btn btn-sm btn-danger" onclick="removeFromBookmarks(${movie.id})">Remove</button>
        `;
        list.appendChild(li);
    });
}

function removeFromBookmarks(id) {
    bookmarks = bookmarks.filter(b => b.id !== id);
    renderBookmarks();
}

searchBtn.addEventListener('click', filterMovies);

getMovies();
