import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBF50gjuKwNYo1tYmZjdSmun7p1vLeSu-s",
    authDomain: "austinandleigha.firebaseapp.com",
    projectId: "austinandleigha",
    storageBucket: "austinandleigha.firebasestorage.app",
    messagingSenderId: "848942131509",
    appId: "1:848942131509:web:00a3e7e00472db7675847c"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firestore
const db = getFirestore(app);


console.log("Firebase connected successfully!");


// Get the gift list container
const giftList = document.getElementById("gift-list");


// Listen to the gifts collection in real time
const giftsCollection = collection(db, "gifts");


onSnapshot(giftsCollection, (snapshot) => {

    // Clear the loading message / existing gifts
    giftList.innerHTML = "";


    // If there are no gifts
    if (snapshot.empty) {

        giftList.innerHTML = `
            <p>No Christmas ideas have been added yet.</p>
        `;

        return;
    }


    snapshot.forEach((giftDoc) => {

        const gift = giftDoc.data();
        const giftId = giftDoc.id;

        console.log("Gift:", giftId, gift);

        const giftCard = document.createElement("div");

        giftCard.classList.add("gift-card");

        giftCard.innerHTML = `
            <h2>${gift.name}</h2>

            <p>
                ${gift.description || ""}
            </p>

            <p class="price">
                $${Number(gift.price).toFixed(2)}
            </p>

            <p>
                For: ${gift.recipient || "Austin & Leigha"}
            </p>

            ${
                gift.url
                    ? `
                        <p>
                            <a
                                href="${gift.url}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Gift
                            </a>
                        </p>
                    `
                    : ""
            }

            ${
                gift.claimed
                    ? `
                        <button disabled>
                            Already Claimed
                        </button>
                    `
                    : `
                        <button
                            class="claim-button"
                            data-id="${giftId}"
                        >
                            Claim Gift
                        </button>
                    `
            }
        `;

        giftList.appendChild(giftCard);
    });

}, (error) => {

    console.error(
        "Error loading gifts:",
        error
    );


    giftList.innerHTML = `
        <p>
            Sorry, there was a problem loading the Christmas list.
        </p>
    `;

});