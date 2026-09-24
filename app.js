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
    apiKey: "AIzaSyBF50gjuKwNYo1tYmZjdSmun7p1vLeSu-s",
    authDomain: "austinandleigha.firebaseapp.com",
    projectId: "austinandleigha",
    storageBucket: "austinandleigha.firebasestorage.app",
    messagingSenderId: "848942131509",
    appId: "1:848942131509:web:00a3e7e00472db7675847c"
};


// ----------------------------------------------------
// EMAILJS CONFIGURATION
// ----------------------------------------------------

const EMAILJS_SERVICE_ID =
    "service_9dretzy";


// Your EXISTING normal gift email template
const EMAILJS_NORMAL_TEMPLATE_ID =
    "template_djlq9ym";


// Create a second EmailJS template for reusable gifts.
// Replace this with the new template ID.
const EMAILJS_REUSABLE_TEMPLATE_ID =
    "template_c7nca4h";


const EMAILJS_PUBLIC_KEY =
    "M8x8Q0YtnxlnpqAtG";


window.emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
});


// ----------------------------------------------------
// INITIALIZE FIREBASE
// ----------------------------------------------------

const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);


console.log(
    "Firebase connected successfully!"
);


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

let giftToClaim = null;

let giftToUndo = null;


// ----------------------------------------------------
// FIRESTORE COLLECTION
// ----------------------------------------------------

const giftsCollection =
    collection(
        db,
        "gifts"
    );


function formatPrice(price) {

    // No price provided
    if (
        price === undefined ||
        price === null ||
        price === ""
    ) {
        return "";
    }


    // If it's already a number
    if (
        typeof price === "number" &&
        Number.isFinite(price)
    ) {
        return `$${price.toFixed(2)}`;
    }


    // If it's a string like "$25" or "25"
    if (typeof price === "string") {

        const cleaned =
            price
                .replace("$", "")
                .replaceAll(",", "")
                .trim();


        const numericPrice =
            Number(cleaned);


        if (
            cleaned !== "" &&
            Number.isFinite(numericPrice)
        ) {
            return `$${numericPrice.toFixed(2)}`;
        }


        // Something like "Any Amount"
        // or "$25+"
        return price;
    }


    return String(price);
}

// ----------------------------------------------------
// LOAD GIFTS
// ----------------------------------------------------

onSnapshot(
    giftsCollection,

    (snapshot) => {

        austinGiftList.innerHTML = "";

        leighaGiftList.innerHTML = "";


        let austinGiftCount = 0;

        let leighaGiftCount = 0;


        snapshot.forEach(
            (giftDoc) => {

                const gift =
                    giftDoc.data();


                const giftId =
                    giftDoc.id;


                /*
                 * Normal claimed gifts disappear.
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
                        : "Claim Gift";


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


                    ${reusableBadge}


                    <h2>
                        ${gift.name}
                    </h2>


                    <p>
                        ${gift.description || ""}
                    </p>


                    ${
                        gift.price !== undefined &&
                        gift.price !== null &&
                        gift.price !== ""
                            ? `
                                <p class="price">
                                    ${formatPrice(gift.price)}
                                </p>
                            `
                            : ""
                    }


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
            austinGiftCount === 0
        ) {

            austinGiftList.innerHTML = `
                <p>
                    No gifts currently
                    available for Austin.
                </p>
            `;

        }


        if (
            leighaGiftCount === 0
        ) {

            leighaGiftList.innerHTML = `
                <p>
                    No gifts currently
                    available for Leigha.
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


        if (!button) {
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


        if (
            giftToClaim.reusable
        ) {

            claimModalMessage.textContent =
                `You're getting "${giftToClaim.name}". ` +
                `This item can be gifted more than once, ` +
                `so it will stay on the Christmas list.`;


            claimEmailHelp.textContent =
                "We'll email you a confirmation. " +
                "Because this item stays available, " +
                "there's no need for an undo link.";


            confirmClaimButton.textContent =
                "I'm Getting This 🎁";

        } else {

            claimModalMessage.textContent =
                `You're claiming "${giftToClaim.name}".`;


            claimEmailHelp.textContent =
                "We'll email you a confirmation and a link " +
                "in case you need to put the gift back.";


            confirmClaimButton.textContent =
                "Claim Gift 🎁";

        }


        claimEmail.value = "";


        emailError.classList.add(
            "hidden"
        );


        claimModal.classList.remove(
            "hidden"
        );


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

        giftToClaim = null;


        claimEmail.value = "";


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


        const email =
            claimEmail.value.trim();


        if (
            email === "" ||
            !claimEmail.checkValidity()
        ) {

            emailError.classList.remove(
                "hidden"
            );


            claimEmail.focus();


            return;

        }


        emailError.classList.add(
            "hidden"
        );


        const giftId =
            giftToClaim.id;


        const reusable =
            giftToClaim.reusable;


        confirmClaimButton.disabled =
            true;


        cancelClaimButton.disabled =
            true;


        confirmClaimButton.textContent =
            reusable
                ? "Sending Confirmation..."
                : "Claiming...";


        let claimedGift = null;


        let normalGiftWasClaimed =
            false;


        try {

            const giftRef =
                doc(
                    db,
                    "gifts",
                    giftId
                );


            // ------------------------------------------------
            // REUSABLE GIFT
            // ------------------------------------------------

            if (
                reusable
            ) {

                /*
                 * Reusable gifts are read only.
                 *
                 * We DO NOT change claimed.
                 * We DO NOT remove them from the site.
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


            // ------------------------------------------------
            // NORMAL GIFT
            // ------------------------------------------------

            else {

                /*
                 * Normal gifts use a Firestore
                 * transaction to prevent two people
                 * from claiming the same gift.
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
                                claimed: true
                            }
                        );

                    }
                );


                normalGiftWasClaimed =
                    true;

            }


            // ------------------------------------------------
            // CREATE UNDO LINK
            // ------------------------------------------------

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


            // ------------------------------------------------
            // EMAIL PARAMETERS
            // ------------------------------------------------

            const templateParams = {

                to_email:
                    email,


                gift_name:
                    claimedGift.name,


                recipient:
                    claimedGift.recipient ||
                    "Austin & Leigha",


                price:
                    `$${Number(
                        claimedGift.price
                    ).toFixed(2)}`,


                gift_url:
                    claimedGift.url ||
                    "",


                undo_link:
                    undoLink

            };


            // ------------------------------------------------
            // PICK EMAIL TEMPLATE
            // ------------------------------------------------

            const templateId =
                reusable
                    ? EMAILJS_REUSABLE_TEMPLATE_ID
                    : EMAILJS_NORMAL_TEMPLATE_ID;


            // ------------------------------------------------
            // SEND EMAIL
            // ------------------------------------------------

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


            // ------------------------------------------------
            // SUCCESS MESSAGE
            // ------------------------------------------------

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
             * If this was a NORMAL gift,
             * Firebase claimed it,
             * but the email failed,
             * put the gift back.
             *
             * Reusable gifts never need rollback
             * because nothing was changed.
             */
            if (
                normalGiftWasClaimed === true
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
                                snapshot.data()
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

            giftToClaim = null;


            confirmClaimButton.disabled =
                false;


            cancelClaimButton.disabled =
                false;


            confirmClaimButton.textContent =
                "Claim Gift 🎁";

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
         * Reusable gifts never need to be undone.
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

        giftToUndo = null;


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


        confirmUndoButton.textContent =
            "Putting It Back...";


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
// REMOVE ?undo= FROM URL
// ----------------------------------------------------

function clearUndoUrl() {

    window.history.replaceState(
        {},
        "",
        window.location.pathname
    );

}


// ----------------------------------------------------
// CHECK FOR UNDO WHEN PAGE LOADS
// ----------------------------------------------------

checkForUndoLink();