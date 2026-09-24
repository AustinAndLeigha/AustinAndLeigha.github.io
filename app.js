import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    doc,
    runTransaction
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


    onSnapshot(giftsCollection, (snapshot) => {

        giftList.innerHTML = "";

        let availableGiftCount = 0;

        snapshot.forEach((giftDoc) => {

            const gift = giftDoc.data();
            const giftId = giftDoc.id;

            // Hide claimed gifts
            if (gift.claimed) {
                return;
            }

            availableGiftCount++;

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

                <button
                    class="claim-button"
                    data-id="${giftId}"
                >
                    Claim Gift
                </button>
            `;

            giftList.appendChild(giftCard);

        });


        // All gifts are claimed or no gifts exist
        if (availableGiftCount === 0) {

            giftList.innerHTML = `
                <p>
                    No Christmas ideas are currently available.
                </p>
            `;

        }

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

    giftList.addEventListener("click", async (event) => {

        // Only respond to Claim Gift buttons
        if (!event.target.classList.contains("claim-button")) {
            return;
        }

        const button = event.target;
        const giftId = button.dataset.id;

        // Ask the user before claiming
        const confirmed = window.confirm(
            "Are you sure you want to claim this gift?"
        );

        if (!confirmed) {
            return;
        }

        // Temporarily disable the button
        button.disabled = true;
        button.textContent = "Claiming...";

        try {

            const giftRef = doc(db, "gifts", giftId);

            await runTransaction(db, async (transaction) => {

                const giftSnapshot = await transaction.get(giftRef);

                if (!giftSnapshot.exists()) {
                    throw new Error("This gift no longer exists.");
                }

                const gift = giftSnapshot.data();

                // Someone beat us to it
                if (gift.claimed === true) {
                    throw new Error(
                        "Sorry! Someone else already claimed this gift."
                    );
                }

                // Claim the gift
                transaction.update(giftRef, {
                    claimed: true
                });

            });

            console.log("Gift claimed successfully!");

            alert("Gift claimed! Thank you! 🎁");

        } catch (error) {

            console.error("Error claiming gift:", error);

            alert(error.message);

            // Re-enable button if claim failed
            button.disabled = false;
            button.textContent = "Claim Gift";
        }

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