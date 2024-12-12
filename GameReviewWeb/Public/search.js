/**
 * Function to generate a styled list item for search results.
 * @param {string} title - The title of the game.
 * @param {string} body - The description of the game.
 * @param {string|null} href - The hyperlink URL for the game (if any).
 * @param {number} date - The release date of the game.
 * @param {string} dev - The developer of the game.
 * @param {string} publisher - The publisher of the game.
 * @param {Array<string>} genres - A list of genres for the game.
 * @param {number} id - The id of the game
 * @param {number} averagescore - The score of the game
 * @returns {HTMLElement} - A styled anchor (`<a>`) element containing the result.
 */

const platformIDs = {
    0: "Windows",
    1: "Mac",
    2: "Linux",
    3: "Android",
    4: "IOS",
    5: "PSX",
    6: "PS2",
    7: "PS3",
    8: "PS4",
    9: "PS5",
    10: "PSP",
    11: "PS_Vita",
    12: "Xbox",
    13: "Xbox_360",
    14: "Xbox_One",
    15: "Xbox_Series_SX",
    16: "NES",
    17: "SNES",
    18: "N64",
    19: "GameCube",
    20: "Wii",
    21: "Wii_U",
    22: "Game_Boy",
    23: "Game_Boy_Colour",
    24: "GBA",
    25: "DS",
    26: "3DS",
    27: "Switch",
    28: "Sega_Mega_Drive",
    29: "Sega_Dreamcast"
};

const genreIDs = {
    1: "Action",
    2: "Shooter",
    3: "Adventure",
    4: "Casual",
    5: "Puzzle",
    6: "RPG",
    7: "Simulation",
    8: "Sports",
    9: "Racing",
    10: "Strategy",
    11: "Rhythm",
    12: "Social"
};


const gameThumbnails = {
    1: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSN5kyGXRsJTnCvfM371Ycg8u7k9viw1gW-g&s"
};

function generateStyledLI(idx, title, href, date, dev, genre, publisher, score, plat) {
    const newHyperlink = document.createElement("a");
    newHyperlink.href = href || "#"; // Set the hyperlink URL or default to "#"

    const newLI = document.createElement("li");
    newLI.classList.add("result");

    const img = document.createElement("img");
    img.classList.add("thumbnailsearch");
    img.src = gameThumbnails[idx];

    const divresult = document.createElement("div");
    divresult.classList.add("resulttext");

    const titleP = document.createElement("p");
    titleP.classList.add("titletext");
    titleP.textContent = title;

    const identifiers = document.createElement("p");
    identifiers.classList.add("identifiers");
    if (dev != publisher) {
        identifiers.textContent = `${dev} | ${publisher}`;
    } else {
        identifiers.textContent = dev
    };
    
    const platdiv = document.createElement("div");
    platdiv.classList.add("platdiv");
    const plats = plat.split(" ").sort((a, b) => a - b);
    plats.forEach(plat => {
        const platimgdiv = document.createElement("div");
        platimgdiv.classList.add("platimgborder");
        const platformIcon = document.createElement("img");
        platformIcon.classList.add("platimg");
        platformIcon.src = `Assets/${platformIDs[plat]}.png`;
        platimgdiv.appendChild(platformIcon);
        platdiv.appendChild(platimgdiv);
    });

    const bodyP = document.createElement("p");
    bodyP.classList.add("bodytext");
    const genres = genre.trim().split(" ").sort((a, b) => a - b);
    let genlist = []
    genres.forEach(genre => {
        genlist.push(genreIDs[genre]);
    });
    bodyP.textContent = genlist.join(", ")

    divresult.appendChild(titleP);
    divresult.appendChild(platdiv);
    divresult.appendChild(identifiers);
    divresult.appendChild(bodyP);

    const divmisc = document.createElement("div");
    divmisc.classList.add("miscinfo");
    const dateP = document.createElement("p");
    dateP.textContent = styleDate(date.toString());
    const rateP = document.createElement("p");
    rateP.textContent = `Rating: ${score}/5`;

    divmisc.appendChild(dateP);
    divmisc.appendChild(rateP);

    newLI.appendChild(img);
    newLI.appendChild(divresult);
    newLI.appendChild(divmisc);

    newHyperlink.appendChild(newLI);
    return newHyperlink;
}

function styleDate(date) {
    const arr = date.split('');
    const year = arr.slice(0, 4).join("");
    const month = arr.slice(4, 6).join("");
    const day = arr.slice(6, 8).join("");
    return `${day}/${month}/${year}`;
}

function removePunctuation(str) {
    return str.split('').filter(char => {
        return /[a-zA-Z0-9 ]/.test(char);
    }).join('');
}

let filters = {
    genres: [],
    developers: [],
    scores: [],
    platforms: [],
    sort: "Relevance"
}

function selectAll(listId, filterType, button) { 
    const filterList = document.getElementById(listId);
    const checkboxes = filterList.querySelectorAll('input[type="checkbox"]');
    
    // Check if any checkbox is currently selected
    const isAnyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

    if (isAnyChecked) {
        // Deselect all checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        // Clear the filter array
        filters[filterType] = [];
        button.textContent = "Select All";  // Update button text to "Select All"
    } else {
        // Select all checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        // Update the filter array with all checkbox IDs
        filters[filterType] = Array.from(checkboxes).map(checkbox => checkbox.id);
        button.textContent = "Clear All";  // Update button text to "Clear All"
    }

    // Reload search results
    loadSearchResults();
}

function countFilters(results) {
    let countedGenres = {};
    let countedDevs = {};
    let countedPlats = {};
    
    results.forEach(result => {
        const genres = result.genres.split(' ');
        const plats = result.platforms.split(' ');
        const dev = result.developer;

        genres.forEach(genre => {
            const relevantGenre = genreIDs[genre];
            countedGenres[relevantGenre] = countedGenres[relevantGenre] + 1 || 1;
        });
        countedDevs[dev] = countedDevs[dev] + 1 || 1;
        plats.forEach(plat => {
            const relevantPlats = platformIDs[plat];
            countedPlats[relevantPlats] = countedPlats[relevantPlats] + 1 || 1;
        });
    });

    return { countedGenres, countedDevs, countedPlats };
};

function generateFilters(numFilters, filterType, filterID) {
    const filterList = document.getElementById(filterID);
    filterList.innerHTML = '';

    // Sort filters from largest to smallest
    const sortedFilters = Object.entries(numFilters).sort((a, b) => b[1] - a[1]);

    for (const [categ, num] of sortedFilters) {
        const listItem = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.id = categ;
        checkbox.name = filterType;
        checkbox.checked = filters[filterType].includes(categ);
        checkbox.onchange = (event) => loadSearchResults(event);

        const labelText = document.createElement('span');
        labelText.classList.add('filterlabeltext');
        labelText.textContent = categ.replace(/_/g, " ");

        const countText = document.createElement('span');
        countText.classList.add('filtercount');
        countText.textContent = num;

        label.appendChild(checkbox);
        label.appendChild(labelText);
        label.appendChild(countText);
        listItem.appendChild(label);
        filterList.appendChild(listItem);
    }
}

async function loadSearchResults(event) {
    let displayresult = document.getElementById("displayresult");
    let searchTerm = "";
    let truncated = "";

    if (event != null) {
        const eventtype = event.target.name
        if (eventtype == "search") {
            searchTerm = event.target.value;
            truncated = removePunctuation(searchTerm.toLowerCase().trim());
        } else if (eventtype != "sort") {
            const checked = event.target.checked;
            const selectedCateg = document.getElementById(eventtype);
            const selectButton = selectedCateg.querySelectorAll(".selectAllButton")[0]
            if (checked) {
                filters[eventtype].push(event.target.id);
                selectButton.textContent = "Clear All"
            } else {
                filters[eventtype] = filters[eventtype].filter(e => e !== event.target.id);
                if (filters[eventtype].length === 0) {
                    selectButton.textContent = "Select All"
                }
            }
        } else {
            const sortby = event.target.innerHTML;
            filters.sort = String(sortby);
            document.getElementById("sortorder").innerHTML = sortby + " ▾";
        }

    }

    displayresult.style.color = truncated ? "rgb(78, 78, 78)" : "black";
    displayresult.textContent = truncated ? `Showing results for: ${searchTerm}` : "Popular Games:";

    let keywords = truncated.split(" ");

    try {
        const response = await fetch('/api/results');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const results = await response.json();

        let matchingResults = results.filter(result => {
            const nameMatch = result.name.toLowerCase().includes(truncated) || 
                              keywords.some(keyword => result.name.toLowerCase().includes(keyword));

            let gens = [];
            result.genres.split(" ").forEach(genre => {
                const translated = genreIDs[genre]
                gens.push(translated);
            });
            const genreMatch = filters.genres.length === 0 ||
                               filters.genres.some(genre => gens.includes(genre));

            const developerMatch = filters.developers.length === 0 || 
                                   filters.developers.includes(result.developer);

            let plats = [];
            result.platforms.split(" ").forEach(plat => {
                const translated = platformIDs[plat];
                plats.push(translated);
            });

            const platformMatch = filters.platforms.length === 0 || 
                                  filters.platforms.some(platform => plats.includes(platform));

            const scoreMatch = result.averagescore >= filters.scores[0] && result.averagescore <= filters.scores[1];

            return nameMatch && genreMatch && developerMatch && platformMatch && scoreMatch;
        });

        const { countedGenres, countedDevs, countedPlats } = countFilters(results);
        generateFilters(countedGenres, "genres", "genreList");
        generateFilters(countedDevs, "developers", "devList");
        generateFilters(countedPlats, "platforms", "platList");

        const list = document.getElementById("containerlist");
        list.innerHTML = "";
        if (matchingResults.length === 0) {
            const noResults = document.createElement("li");
            noResults.id = "noresult";
            noResults.textContent = "No matching results found.";
            list.appendChild(noResults);

        } else {
            const selectedSort = filters.sort
        
            matchingResults.sort((a, b) => {
                if (selectedSort === "Relevance") {
                    const aFullMatch = a.name.toLowerCase().includes(truncated);
                    const bFullMatch = b.name.toLowerCase().includes(truncated);
                    if (aFullMatch && !bFullMatch) return -1;
                    if (!aFullMatch && bFullMatch) return 1;
                    return 0;
                } else if (selectedSort === "Title: A-Z") {
                    return a.name.localeCompare(b.name);
                } else if (selectedSort === "Title: Z-A") {
                    return b.name.localeCompare(a.name);
                } else if (selectedSort === "Rating: Low-High") {
                    return a.averagescore - b.averagescore;
                } else if (selectedSort === "Rating: High-Low") {
                    return b.averagescore - a.averagescore;
                } else if (selectedSort === "Release Date: New-Old") {
                    return b["release date"] - a["release date"];
                } else if (selectedSort === "Release Date: Old-New") {
                    return a["release date"] - b["release date"];
                }
            });

            matchingResults.forEach(result => {
                const newItem = generateStyledLI(
                    1, result.name, null, 
                    result["release date"], result.developer, 
                    result.genres, result.publisher, result.averagescore, result.platforms
                );
                list.appendChild(newItem);
            });
        };
        

        const slidernum = document.getElementById("slidernum");
        slidernum.textContent = `${matchingResults.length} Results`;

    } catch (error) {
        console.error("Failed to load search results:", error);
    }
};

const minSlider = document.getElementById("minSlider");
const maxSlider = document.getElementById("maxSlider");
const rangeFill = document.querySelector(".rangefill");
const minValue = document.getElementById("minvalue");
const maxValue = document.getElementById("maxvalue");

// Update the range fill position and width
function updateRange() {
    const min = parseFloat(minSlider.value);
    const max = parseFloat(maxSlider.value);
    const minPercent = (min / minSlider.max) * 100;
    const maxPercent = (max / maxSlider.max) * 100;

    rangeFill.style.left = `${minPercent}%`;
    rangeFill.style.width = `${maxPercent - minPercent}%`;
    minValue.value = min/10;
    maxValue.value = max/10;
    filters.scores = [minValue.value, maxValue.value]; 
    loadSearchResults(null);
}

// Prevent min slider from going past the max slider
minSlider.addEventListener("input", () => {
    if (parseFloat(minSlider.value) >= parseFloat(maxSlider.value)) {
        minSlider.value = maxSlider.value - 1; // Ensure a gap
    }
    updateRange();
});

// Prevent max slider from going past the min slider
maxSlider.addEventListener("input", () => {
    if (parseFloat(maxSlider.value) <= parseFloat(minSlider.value)) {
        maxSlider.value = parseFloat(minSlider.value) + 1; // Ensure a gap
    }
    updateRange();
});

minValue.addEventListener("input", () => {
    const minval = parseFloat(minValue.value);
    const maxval = parseFloat(maxValue.value);

    if (minval >= maxval) {
        minSlider.value = maxval * 10 - 1; // Ensure a gap
    } else {
        minSlider.value = minval * 10;
    }
    updateRange();
});

maxValue.addEventListener("input", () => {
    const minval = parseFloat(minValue.value);
    const maxval = parseFloat(maxValue.value);

    if (maxval <= minval) {
        maxSlider.value = minval * 10 + 1; // Ensure a gap
    } else {
        maxSlider.value = maxval * 10;
    }
    updateRange();
});


// Initialize the range fill
updateRange();

// Load initial results when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", loadSearchResults(null));
