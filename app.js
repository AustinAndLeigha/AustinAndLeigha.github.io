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


// Get the gift list containers
const austinGiftList =
    document.getElementById("austin-gift-list");

const leighaGiftList =
    document.getElementById("leigha-gift-list");

const claimModal =
    document.getElementById("claim-modal");

const claimModalMessage =
    document.getElementById("claim-modal-message");

const confirmClaimButton =
    document.getElementById("confirm-claim");

const cancelClaimButton =
    document.getElementById("cancel-claim");


let giftToClaim = null;


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

        austinGiftList.innerHTML = "";
        leighaGiftList.innerHTML = "";


        let austinGiftCount = 0;
        let leighaGiftCount = 0;


        snapshot.forEach((giftDoc) => {

            const gift = giftDoc.data();
            const giftId = giftDoc.id;


            // Do not show claimed gifts
            if (gift.claimed) {
                return;
            }


            const giftCard =
                document.createElement("div");

            giftCard.classList.add("gift-card");


            giftCard.innerHTML = `
                ${
                    gift.imageUrl
                        ? `
                            <img
                                src="${gift.imageUrl}"
                                alt="${gift.name}"
                                class="gift-image"
                            >
                        `
                        : ""
                }

                <h2>${gift.name}</h2>

                <p>
                    ${gift.description || ""}
                </p>

                <p class="price">
                    $${Number(gift.price).toFixed(2)}
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
                    class="claim-button gift-claim-button"
                    data-id="${giftId}"
                    data-name="${gift.name}"
                >
                    Claim Gift
                </button>
            `;


            const recipient =
                (gift.recipient || "").toLowerCase();


            if (recipient === "leigha") {

                leighaGiftList.appendChild(giftCard);

                leighaGiftCount++;

            } else {

                austinGiftList.appendChild(giftCard);

                austinGiftCount++;

            }

        });


        if (austinGiftCount === 0) {

            austinGiftList.innerHTML = `
                <p>
                    No gifts currently available for Austin.
                </p>
            `;

        }


        if (leighaGiftCount === 0) {

            leighaGiftList.innerHTML = `
                <p>
                    No gifts currently available for Leigha.
                </p>
            `;

        }

    }, (error) => {

        console.error(
            "Error loading gifts:",
            error
        );


        austinGiftList.innerHTML = `
            <p>
                Sorry, there was a problem loading the list.
            </p>
        `;


        leighaGiftList.innerHTML = `
            <p>
                Sorry, there was a problem loading the list.
            </p>
        `;

    });

    document.addEventListener("click", (event) => {

        const button =
            event.target.closest(".gift-claim-button");


        if (!button) {
            return;
        }


        giftToClaim = {
            id: button.dataset.id,
            name: button.dataset.name
        };


        claimModalMessage.textContent =
            `Are you sure you want to claim "${giftToClaim.name}"?`;


        claimModal.classList.remove("hidden");

    });

    cancelClaimButton.addEventListener("click", () => {

        giftToClaim = null;

        claimModal.classList.add("hidden");

    });

    confirmClaimButton.addEventListener(
        "click",
        async () => {

            if (!giftToClaim) {
                return;
            }


            const giftId = giftToClaim.id;


            confirmClaimButton.disabled = true;

            confirmClaimButton.textContent =
                "Claiming...";


            try {

                const giftRef =
                    doc(db, "gifts", giftId);


                await runTransaction(
                    db,
                    async (transaction) => {

                        const giftSnapshot =
                            await transaction.get(giftRef);


                        if (!giftSnapshot.exists()) {

                            throw new Error(
                                "This gift no longer exists."
                            );

                        }


                        const gift =
                            giftSnapshot.data();


                        if (gift.claimed === true) {

                            throw new Error(
                                "Sorry! Someone else already claimed this gift."
                            );

                        }


                        transaction.update(
                            giftRef,
                            {
                                claimed: true
                            }
                        );

                    }
                );


                claimModal.classList.add("hidden");

                alert(
                    "Gift claimed! Thank you! 🎁"
                );


            } catch (error) {

                console.error(
                    "Error claiming gift:",
                    error
                );


                alert(error.message);

            } finally {

                giftToClaim = null;

                confirmClaimButton.disabled = false;

                confirmClaimButton.textContent =
                    "Yes, Claim It!";

            }

        }
    );

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