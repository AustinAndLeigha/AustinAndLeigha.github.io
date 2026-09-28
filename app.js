import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    doc,
    getDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ----------------------------------------------------
// FIREBASE CONFIGURATION
// ----------------------------------------------------

const firebaseConfig = {

    apiKey:
        "AIzaSyBF50gjuKwNYo1tYmZjdSmun7p1vLeSu-s",

    authDomain:
        "austinandleigha.firebaseapp.com",

    projectId:
        "austinandleigha",

    storageBucket:
        "austinandleigha.firebasestorage.app",

    messagingSenderId:
        "848942131509",

    appId:
        "1:848942131509:web:00a3e7e00472db7675847c"

};


// ----------------------------------------------------
// EMAILJS CONFIGURATION
// ----------------------------------------------------

const EMAILJS_SERVICE_ID =
    "service_9dretzy";


// Normal gift template
const EMAILJS_NORMAL_TEMPLATE_ID =
    "template_djlq9ym";


// Replace this with the reusable gift template
// you created in EmailJS.
const EMAILJS_REUSABLE_TEMPLATE_ID =
    "template_c7nca4h";


const EMAILJS_PUBLIC_KEY =
    "M8x8Q0YtnxlnpqAtG";


window.emailjs.init({

    publicKey:
        EMAILJS_PUBLIC_KEY

});


// ----------------------------------------------------
// INITIALIZE FIREBASE
// ----------------------------------------------------

const app =
    initializeApp(
        firebaseConfig
    );


const db =
    getFirestore(
        app
    );


console.log(
    "Firebase connected successfully!"
);


// ----------------------------------------------------
// FORMAT PRICE
// ----------------------------------------------------

function formatPrice(price) {

    if (
        price === undefined ||
        price === null ||
        price === ""
    ) {

        return "";

    }


    /*
     * Firestore number:
     *
     * 25
     * becomes
     * $25.00
     */

    if (
        typeof price === "number" &&
        Number.isFinite(price)
    ) {

        return `$${price.toFixed(2)}`;

    }


    /*
     * Strings are also allowed:
     *
     * "$25"
     * "25"
     * "Any Amount"
     * "$25+"
     */

    if (
        typeof price === "string"
    ) {

        const cleaned =
            price
                .replaceAll("$", "")
                .replaceAll(",", "")
                .trim();


        const numericPrice =
            Number(
                cleaned
            );


        if (
            cleaned !== "" &&
            Number.isFinite(
                numericPrice
            )
        ) {

            return `$${numericPrice.toFixed(2)}`;

        }


        /*
         * Non-numeric text remains unchanged.
         */

        return price;

    }


    return String(
        price
    );

}


// ----------------------------------------------------
// PAGE ELEMENTS
// ----------------------------------------------------

const austinGiftList =
    document.getElementById(
        "austin-gift-list"
    );


const leighaGiftList =
    document.getElementById(
        "leigha-gift-list"
    );


// Claim modal

const claimModal =
    document.getElementById(
        "claim-modal"
    );


const claimModalMessage =
    document.getElementById(
        "claim-modal-message"
    );


const claimEmail =
    document.getElementById(
        "claim-email"
    );


const confirmClaimEmail =
    document.getElementById(
        "confirm-claim-email"
    );


const claimEmailHelp =
    document.getElementById(
        "claim-email-help"
    );


const emailError =
    document.getElementById(
        "email-error"
    );


const confirmClaimButton =
    document.getElementById(
        "confirm-claim"
    );


const cancelClaimButton =
    document.getElementById(
        "cancel-claim"
    );


// Undo modal

const undoModal =
    document.getElementById(
        "undo-modal"
    );


const undoModalMessage =
    document.getElementById(
        "undo-modal-message"
    );


const confirmUndoButton =
    document.getElementById(
        "confirm-undo"
    );


const cancelUndoButton =
    document.getElementById(
        "cancel-undo"
    );


// ----------------------------------------------------
// STATE
// ----------------------------------------------------

let giftToClaim =
    null;


let giftToUndo =
    null;


// ----------------------------------------------------
// FIRESTORE COLLECTION
// ----------------------------------------------------

const giftsCollection =
    collection(
        db,
        "gifts"
    );


// ----------------------------------------------------
// LOAD GIFTS
// ----------------------------------------------------

onSnapshot(

    giftsCollection,

    (snapshot) => {

        austinGiftList.innerHTML =
            "";


        leighaGiftList.innerHTML =
            "";


        let austinGiftCount =
            0;


        let leighaGiftCount =
            0;


        snapshot.forEach(
            (giftDoc) => {

                const gift =
                    giftDoc.data();


                const giftId =
                    giftDoc.id;


                /*
                 * Normal gifts disappear after being claimed.
                 *
                 * Reusable gifts stay visible forever.
                 */

                if (
                    gift.claimed === true &&
                    gift.reusable !== true
                ) {

                    return;

                }


                const giftCard =
                    document.createElement(
                        "div"
                    );


                giftCard.classList.add(
                    "gift-card"
                );


                const reusableBadge =
                    gift.reusable === true
                        ? `
                            <div class="reusable-badge">
                                ♻️ Can Be Gifted More Than Once
                            </div>
                        `
                        : "";


                const buttonText =
                    gift.reusable === true
                        ? "I'm Getting This 🎁"
                        : "Claim Gift 🎁";


                const priceHtml =
                    formatPrice(
                        gift.price
                    ) !== ""
                        ? `
                            <p class="price">
                                ${formatPrice(
                                    gift.price
                                )}
                            </p>
                        `
                        : "";


                const imageHtml =
                    gift.imageUrl
                        ? `
                            <img
                                src="${gift.imageUrl}"
                                alt="${gift.name}"
                                class="gift-image"
                            >
                        `
                        : "";


                const viewGiftHtml =
                    gift.url
                        ? `
                            <a
                                href="${gift.url}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="view-gift-button"
                            >
                                View Gift ↗
                            </a>
                        `
                        : "";


                giftCard.innerHTML = `

                    ${imageHtml}

                    ${reusableBadge}

                    <h2>
                        ${gift.name}
                    </h2>

                    <p>
                        ${gift.description || ""}
                    </p>

                    ${priceHtml}

                    ${viewGiftHtml}

                    <button
                        class="
                            claim-button
                            gift-claim-button
                        "
                        data-id="${giftId}"
                        data-name="${gift.name}"
                        data-reusable="${gift.reusable === true}"
                    >
                        ${buttonText}
                    </button>

                `;


                const recipient =
                    (
                        gift.recipient ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                if (
                    recipient ===
                    "leigha"
                ) {

                    leighaGiftList
                        .appendChild(
                            giftCard
                        );


                    leighaGiftCount++;

                } else {

                    austinGiftList
                        .appendChild(
                            giftCard
                        );


                    austinGiftCount++;

                }

            }
        );


        if (
            austinGiftCount ===
            0
        ) {

            austinGiftList.innerHTML = `
                <p>
                    No gifts currently available for Austin.
                </p>
            `;

        }


        if (
            leighaGiftCount ===
            0
        ) {

            leighaGiftList.innerHTML = `
                <p>
                    No gifts currently available for Leigha.
                </p>
            `;

        }

    },


    (error) => {

        console.error(
            "Error loading gifts:",
            error
        );


        austinGiftList.innerHTML = `
            <p>
                Sorry, there was a problem
                loading Austin's list.
            </p>
        `;


        leighaGiftList.innerHTML = `
            <p>
                Sorry, there was a problem
                loading Leigha's list.
            </p>
        `;

    }

);


// ----------------------------------------------------
// OPEN CLAIM MODAL
// ----------------------------------------------------

document.addEventListener(

    "click",

    (event) => {

        const button =
            event.target.closest(
                ".gift-claim-button"
            );


        if (
            !button
        ) {

            return;

        }


        giftToClaim = {

            id:
                button.dataset.id,

            name:
                button.dataset.name,

            reusable:
                button.dataset.reusable ===
                "true"

        };


        /*
         * Different messaging depending
         * on whether the item is reusable.
         */

        if (
            giftToClaim.reusable
        ) {

            claimModalMessage.textContent =
                `You're getting "${giftToClaim.name}". ` +
                `This item can be gifted more than once, ` +
                `so it will stay on the Christmas list.`;


            claimEmailHelp.textContent =
                "Enter your email twice so we can send " +
                "your confirmation to the correct address. " +
                "This item stays available, so no undo link is needed.";


            confirmClaimButton.textContent =
                "I'm Getting This 🎁";

        } else {

            claimModalMessage.textContent =
                `You're claiming "${giftToClaim.name}".`;


            claimEmailHelp.textContent =
                "Enter your email twice so we can make sure " +
                "your confirmation and undo link go to the correct address.";


            confirmClaimButton.textContent =
                "Claim Gift 🎁";

        }


        claimEmail.value =
            "";


        confirmClaimEmail.value =
            "";


        emailError.classList.add(
            "hidden"
        );


        claimModal.classList.remove(
            "hidden"
        );


        /*
         * Focus email field after modal opens.
         */

        setTimeout(

            () => {

                claimEmail.focus();

            },

            100

        );

    }

);


// ----------------------------------------------------
// CANCEL CLAIM
// ----------------------------------------------------

cancelClaimButton.addEventListener(

    "click",

    () => {

        giftToClaim =
            null;


        claimEmail.value =
            "";


        confirmClaimEmail.value =
            "";


        emailError.classList.add(
            "hidden"
        );


        claimModal.classList.add(
            "hidden"
        );


        confirmClaimButton.textContent =
            "Claim Gift 🎁";

    }

);


// ----------------------------------------------------
// CONFIRM CLAIM
// ----------------------------------------------------

confirmClaimButton.addEventListener(

    "click",

    async () => {

        if (
            !giftToClaim
        ) {

            return;

        }


        // ------------------------------------------
        // EMAIL VALIDATION
        // ------------------------------------------

        const email =
            claimEmail.value.trim();


        const confirmedEmail =
            confirmClaimEmail.value.trim();


        if (
            email === "" ||
            !claimEmail.checkValidity()
        ) {

            emailError.textContent =
                "Please enter a valid email address.";


            emailError.classList.remove(
                "hidden"
            );


            claimEmail.focus();


            return;

        }


        if (
            confirmedEmail === "" ||
            !confirmClaimEmail.checkValidity()
        ) {

            emailError.textContent =
                "Please confirm your email address.";


            emailError.classList.remove(
                "hidden"
            );


            confirmClaimEmail.focus();


            return;

        }


        if (
            email.toLowerCase() !==
            confirmedEmail.toLowerCase()
        ) {

            emailError.textContent =
                "The email addresses don't match. " +
                "Please check them and try again.";


            emailError.classList.remove(
                "hidden"
            );


            confirmClaimEmail.focus();


            return;

        }


        emailError.classList.add(
            "hidden"
        );


        // ------------------------------------------
        // CAPTURE CLAIM VALUES
        // ------------------------------------------

        const giftId =
            giftToClaim.id;


        const reusable =
            giftToClaim.reusable;


        // ------------------------------------------
        // DISABLE BUTTONS
        // ------------------------------------------

        confirmClaimButton.disabled =
            true;


        cancelClaimButton.disabled =
            true;


        /*
         * Show real loading spinner.
         */

        confirmClaimButton.innerHTML =
            reusable
                ? `
                    <span class="button-loading">
                        <span class="button-spinner"></span>
                        <span>Sending...</span>
                    </span>
                `
                : `
                    <span class="button-loading">
                        <span class="button-spinner"></span>
                        <span>Claiming...</span>
                    </span>
                `;


        let claimedGift =
            null;


        let normalGiftWasClaimed =
            false;


        try {

            const giftRef =
                doc(
                    db,
                    "gifts",
                    giftId
                );


            // ------------------------------------------
            // REUSABLE GIFT
            // ------------------------------------------

            if (
                reusable
            ) {

                /*
                 * Reusable gifts are never marked
                 * as claimed.
                 */

                const giftSnapshot =
                    await getDoc(
                        giftRef
                    );


                if (
                    !giftSnapshot.exists()
                ) {

                    throw new Error(
                        "This gift no longer exists."
                    );

                }


                claimedGift =
                    giftSnapshot.data();

            }


            // ------------------------------------------
            // NORMAL GIFT
            // ------------------------------------------

            else {

                /*
                 * Firestore transaction ensures two people
                 * can't claim the same normal gift.
                 */

                await runTransaction(

                    db,

                    async (
                        transaction
                    ) => {

                        const giftSnapshot =
                            await transaction.get(
                                giftRef
                            );


                        if (
                            !giftSnapshot.exists()
                        ) {

                            throw new Error(
                                "This gift no longer exists."
                            );

                        }


                        const gift =
                            giftSnapshot.data();


                        if (
                            gift.claimed === true
                        ) {

                            throw new Error(
                                "Sorry! Someone else already claimed this gift."
                            );

                        }


                        claimedGift =
                            gift;


                        transaction.update(

                            giftRef,

                            {
                                claimed:
                                    true
                            }

                        );

                    }

                );


                normalGiftWasClaimed =
                    true;

            }


            // ------------------------------------------
            // UNDO LINK
            // ------------------------------------------

            let undoLink =
                "";


            if (
                !reusable
            ) {

                undoLink =
                    `${window.location.origin}` +
                    `${window.location.pathname}` +
                    `?undo=${encodeURIComponent(
                        giftId
                    )}`;

            }


            // ------------------------------------------
            // EMAIL PARAMETERS
            // ------------------------------------------

            const templateParams = {

                to_email:
                    email,


                gift_name:
                    claimedGift.name,


                recipient:
                    claimedGift.recipient ||
                    "Austin & Leigha",


                price:
                    formatPrice(
                        claimedGift.price
                    ),


                gift_url:
                    claimedGift.url ||
                    "",


                undo_link:
                    undoLink

            };


            // ------------------------------------------
            // PICK EMAIL TEMPLATE
            // ------------------------------------------

            const templateId =
                reusable
                    ? EMAILJS_REUSABLE_TEMPLATE_ID
                    : EMAILJS_NORMAL_TEMPLATE_ID;


            // ------------------------------------------
            // SEND EMAIL
            // ------------------------------------------

            await window.emailjs.send(

                EMAILJS_SERVICE_ID,

                templateId,

                templateParams

            );


            console.log(
                "Confirmation email sent."
            );


            claimModal.classList.add(
                "hidden"
            );


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            if (
                reusable
            ) {

                alert(
                    "Got it! 🎁\n\n" +
                    "Check your email for your confirmation.\n\n" +
                    "This item will stay on the list so " +
                    "someone else can get one too."
                );

            } else {

                alert(
                    "Gift claimed! 🎁\n\n" +
                    "Check your email for your " +
                    "confirmation and undo link."
                );

            }

        } catch (
            error
        ) {

            console.error(
                "Error claiming gift:",
                error
            );


            /*
             * If Firebase claimed a NORMAL gift
             * but EmailJS failed, automatically
             * put the gift back.
             */

            if (
                normalGiftWasClaimed ===
                true
            ) {

                try {

                    const giftRef =
                        doc(
                            db,
                            "gifts",
                            giftId
                        );


                    await runTransaction(

                        db,

                        async (
                            transaction
                        ) => {

                            const snapshot =
                                await transaction.get(
                                    giftRef
                                );


                            if (
                                snapshot.exists() &&
                                snapshot
                                    .data()
                                    .claimed === true
                            ) {

                                transaction.update(

                                    giftRef,

                                    {
                                        claimed:
                                            false
                                    }

                                );

                            }

                        }

                    );


                    console.log(
                        "Claim rolled back because email failed."
                    );

                } catch (
                    rollbackError
                ) {

                    console.error(
                        "Could not roll back claim:",
                        rollbackError
                    );

                }

            }


            if (
                reusable
            ) {

                alert(
                    "We couldn't send your confirmation email.\n\n" +
                    "Nothing was removed from the Christmas list. " +
                    "Please try again."
                );

            } else {

                alert(
                    "We couldn't complete the claim.\n\n" +
                    "The gift has been put back on the list. " +
                    "Please try again."
                );

            }

        } finally {

            giftToClaim =
                null;


            confirmClaimButton.disabled =
                false;


            cancelClaimButton.disabled =
                false;


            /*
             * Restore normal button text after spinner.
             */

            confirmClaimButton.textContent =
                reusable
                    ? "I'm Getting This 🎁"
                    : "Claim Gift 🎁";

        }

    }

);


// ----------------------------------------------------
// HANDLE UNDO LINK
// ----------------------------------------------------

async function checkForUndoLink() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const giftId =
        params.get(
            "undo"
        );


    if (
        !giftId
    ) {

        return;

    }


    try {

        const giftRef =
            doc(
                db,
                "gifts",
                giftId
            );


        const giftSnapshot =
            await getDoc(
                giftRef
            );


        if (
            !giftSnapshot.exists()
        ) {

            alert(
                "This gift could not be found."
            );


            clearUndoUrl();


            return;

        }


        const gift =
            giftSnapshot.data();


        /*
         * Reusable items should never need undo.
         */

        if (
            gift.reusable === true
        ) {

            alert(
                `"${gift.name}" is a reusable gift idea ` +
                "and is already available to everyone."
            );


            clearUndoUrl();


            return;

        }


        if (
            gift.claimed !== true
        ) {

            alert(
                `"${gift.name}" is already ` +
                "available on the Christmas list."
            );


            clearUndoUrl();


            return;

        }


        giftToUndo = {

            id:
                giftId,

            name:
                gift.name

        };


        undoModalMessage.textContent =
            `Would you like to put ` +
            `"${gift.name}" back on the ` +
            `Christmas list?`;


        undoModal.classList.remove(
            "hidden"
        );

    } catch (
        error
    ) {

        console.error(
            "Error loading undo gift:",
            error
        );

    }

}


// ----------------------------------------------------
// CANCEL UNDO
// ----------------------------------------------------

cancelUndoButton.addEventListener(

    "click",

    () => {

        giftToUndo =
            null;


        undoModal.classList.add(
            "hidden"
        );


        clearUndoUrl();

    }

);


// ----------------------------------------------------
// CONFIRM UNDO
// ----------------------------------------------------

confirmUndoButton.addEventListener(

    "click",

    async () => {

        if (
            !giftToUndo
        ) {

            return;

        }


        confirmUndoButton.disabled =
            true;


        cancelUndoButton.disabled =
            true;


        /*
         * Spinner for undo operation too.
         */

        confirmUndoButton.innerHTML = `
            <span class="button-loading">
                <span class="button-spinner"></span>
                <span>Putting It Back...</span>
            </span>
        `;


        try {

            const giftRef =
                doc(
                    db,
                    "gifts",
                    giftToUndo.id
                );


            await runTransaction(

                db,

                async (
                    transaction
                ) => {

                    const giftSnapshot =
                        await transaction.get(
                            giftRef
                        );


                    if (
                        !giftSnapshot.exists()
                    ) {

                        throw new Error(
                            "This gift no longer exists."
                        );

                    }


                    const gift =
                        giftSnapshot.data();


                    if (
                        gift.reusable === true
                    ) {

                        throw new Error(
                            "This gift is reusable and is already available."
                        );

                    }


                    if (
                        gift.claimed !== true
                    ) {

                        throw new Error(
                            "This gift is already available."
                        );

                    }


                    transaction.update(

                        giftRef,

                        {
                            claimed:
                                false
                        }

                    );

                }

            );


            const giftName =
                giftToUndo.name;


            giftToUndo =
                null;


            undoModal.classList.add(
                "hidden"
            );


            clearUndoUrl();


            alert(
                `"${giftName}" has been put ` +
                "back on the Christmas list! 🎁"
            );

        } catch (
            error
        ) {

            console.error(
                "Error undoing claim:",
                error
            );


            alert(
                error.message
            );

        } finally {

            confirmUndoButton.disabled =
                false;


            cancelUndoButton.disabled =
                false;


            confirmUndoButton.textContent =
                "Put It Back";

        }

    }

);


// ----------------------------------------------------
// REMOVE UNDO PARAMETER
// ----------------------------------------------------

function clearUndoUrl() {

    window.history.replaceState(

        {},

        "",

        window.location.pathname

    );

}


// ----------------------------------------------------
// CHECK FOR UNDO ON PAGE LOAD
// ----------------------------------------------------

checkForUndoLink();