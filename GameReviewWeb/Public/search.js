/**
 * Function to generate a styled list item for search results.
 * @param {string} imgsrc - The URL of the image to display.
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
function generateStyledLI(imgsrc, title, body, href, date, dev, genres, publisher, id, score) {
    const newHyperlink = document.createElement("a");
    newHyperlink.href = href || "#"; // Set the hyperlink URL or default to "#"

    const newLI = document.createElement("li");
    newLI.classList.add("result");

    const img = document.createElement("img");
    img.classList.add("thumbnailsearch");
    img.src = imgsrc;

    const divresult = document.createElement("div");
    divresult.classList.add("resulttext");

    const titleP = document.createElement("p");
    titleP.classList.add("titletext");
    titleP.textContent = title;

    const identifiers = document.createElement("p");
    identifiers.classList.add("identifiers");
    identifiers.textContent = `${dev} | ${publisher}`;

    const bodyP = document.createElement("p");
    bodyP.classList.add("bodytext");
    bodyP.textContent = body;

    divresult.appendChild(titleP);
    divresult.appendChild(identifiers);
    divresult.appendChild(bodyP);

    const divmisc = document.createElement("div");
    divmisc.classList.add("miscinfo");
    const dateP = document.createElement("p");
    dateP.textContent = styleDate(date.toString());
    const rateP = document.createElement("p");
    rateP.textContent = `Rating: ${score}/10`;

    divmisc.appendChild(dateP);
    divmisc.appendChild(document.createElement("br"));
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

async function loadSearchResults(event) {
    let displayresult = document.getElementById("displayresult");
    let truncated = "";
    let searchTerm = "";
    if (event != null) {
        const eventtype = event.target.name
        if (eventtype == "search") {
            searchTerm = event.target.value;
            truncated = removePunctuation(searchTerm.toLowerCase().trim());
        } else if (eventtype != "sort") {
            const checked = event.target.checked;
            if (checked) {
                filters[eventtype].push(event.target.id);
            } else {
                filters[eventtype] = filters[eventtype].filter(e => e !== event.target.id);
            }
        } else {
            const sortby = event.target.innerHTML;
            filters.sort = String(sortby);
            document.getElementById("sortorder").innerHTML = sortby + " ▾";
        }

    }
    
    console.log(filters)
    displayresult.style.color = "rgb(78, 78, 78)";
    if (truncated != "") {
        displayresult.textContent = "Showing results for: " + searchTerm;
    } else {
        displayresult.style.color = "black";
        displayresult.textContent = "Popular Games:";
    };

    let keywords = truncated.split(" ");
    try {
        // Fetch results from the server's API endpoint
        const response = await fetch('/api/results');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };

        const results = await response.json(); // Parse the JSON data
        const list = document.getElementById("containerlist");

        // Clear the list first
        list.innerHTML = "";

        // Filter and append each result to the list
        // Filter the results
        let matchingResults = results.filter(result => {
            console.log(result);
            // Check if the game name matches the search term
            const nameMatch = result.name.toLowerCase().includes(truncated) || 
                              keywords.some(keyword => result.name.toLowerCase().includes(keyword));
        
            // Check if the game's genre matches any of the selected genres
            const genreMatch = filters.genres.length === 0 || 
                               filters.genres.some(genre => result.genres.includes(genre));
        
            // Check if the game's developer matches any of the selected developers
            const developerMatch = filters.developers.length === 0 || 
                                   filters.developers.includes(result.developer);
        
            // Check if the game's platform matches any of the selected platforms
            const platformMatch = filters.platforms.length === 0 || 
                                  filters.platforms.some(platform => result.platforms.includes(platform));
        
            // Check if the game's score is within the selected range
            const scoreMatch = result.averagescore >= filters.scores[0] && result.averagescore <= filters.scores[1];
        
            // Return true only if all conditions are met
            return nameMatch && genreMatch && developerMatch && platformMatch && scoreMatch;
        });
        

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

        if (matchingResults.length === 0) {
            const noResultsItem = document.createElement("li");
            noResultsItem.id = "noresult";
            noResultsItem.textContent = "No results matching your search";
            list.appendChild(noResultsItem);
        } else {
            matchingResults.forEach(result => {

                const newItem = generateStyledLI(
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSN5kyGXRsJTnCvfM371Ycg8u7k9viw1gW-g&s", // Example thumbnail URL
                    result.name, // Game name
                    result.description, // Game description
                    null, // No specific link in this example
                    result["release date"], // Game release date
                    result.developer, // Game developer
                    result.genres, // Game genres
                    result.publisher, // Game publisher
                    result.id, // Game id
                    result.averagescore, // Game score
                );
                list.appendChild(newItem);
            });
        };
    } catch (error) {
        console.error("Failed to load search results:", error);
    };
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
    console.log(filters)
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
