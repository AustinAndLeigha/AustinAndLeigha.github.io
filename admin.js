import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getFirestore,
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ----------------------------------------------------
// CONFIG
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


// IMPORTANT:
//
// This MUST be the same email that you
// placed in your Firestore rules.

const ADMIN_EMAIL =
    "Awhitta3@gmail.com";


// ----------------------------------------------------
// FIREBASE
// ----------------------------------------------------

const app =
    initializeApp(
        firebaseConfig
    );


const db =
    getFirestore(
        app
    );


const auth =
    getAuth(
        app
    );


const googleProvider =
    new GoogleAuthProvider();


// ----------------------------------------------------
// ELEMENTS
// ----------------------------------------------------

const loginCard =
    document.getElementById(
        "login-card"
    );


const adminApp =
    document.getElementById(
        "admin-app"
    );


const googleLoginButton =
    document.getElementById(
        "google-login"
    );


const signOutButton =
    document.getElementById(
        "sign-out"
    );


const signedInEmail =
    document.getElementById(
        "signed-in-email"
    );


const authMessage =
    document.getElementById(
        "auth-message"
    );


const giftForm =
    document.getElementById(
        "gift-form"
    );


const formTitle =
    document.getElementById(
        "form-title"
    );


const saveGiftButton =
    document.getElementById(
        "save-gift"
    );


const cancelEditButton =
    document.getElementById(
        "cancel-edit"
    );


const giftAdminList =
    document.getElementById(
        "gift-admin-list"
    );


const giftName =
    document.getElementById(
        "gift-name"
    );


const giftRecipient =
    document.getElementById(
        "gift-recipient"
    );


const giftPrice =
    document.getElementById(
        "gift-price"
    );


const giftDescription =
    document.getElementById(
        "gift-description"
    );


const giftUrl =
    document.getElementById(
        "gift-url"
    );


const giftImageUrl =
    document.getElementById(
        "gift-image-url"
    );


const giftReusable =
    document.getElementById(
        "gift-reusable"
    );


// ----------------------------------------------------
// STATE
// ----------------------------------------------------

let editingGiftId =
    null;


const giftCache =
    new Map();


let unsubscribeFromGifts =
    null;


// ----------------------------------------------------
// LOGIN
// ----------------------------------------------------

googleLoginButton.addEventListener(
    "click",

    async () => {

        authMessage.textContent =
            "";


        try {

            await signInWithPopup(
                auth,
                googleProvider
            );

        } catch (
            error
        ) {

            console.error(
                "Login error:",
                error
            );


            authMessage.textContent =
                "Could not sign in. Please try again.";

        }

    }
);


// ----------------------------------------------------
// SIGN OUT
// ----------------------------------------------------

signOutButton.addEventListener(
    "click",

    async () => {

        await signOut(
            auth
        );

    }
);


// ----------------------------------------------------
// AUTH STATE
// ----------------------------------------------------

onAuthStateChanged(

    auth,

    async (
        user
    ) => {

        if (
            !user
        ) {

            showLogin();

            return;

        }


        if (
            user.email
                ?.toLowerCase() !==
            ADMIN_EMAIL
                .toLowerCase()
        ) {

            authMessage.textContent =
                "This Google account is not authorized.";


            await signOut(
                auth
            );


            return;

        }


        loginCard.classList.add(
            "hidden"
        );


        adminApp.classList.remove(
            "hidden"
        );


        signedInEmail.textContent =
            user.email;


        startGiftListener();

    }

);


// ----------------------------------------------------
// SHOW LOGIN
// ----------------------------------------------------

function showLogin() {

    loginCard.classList.remove(
        "hidden"
    );


    adminApp.classList.add(
        "hidden"
    );


    if (
        unsubscribeFromGifts
    ) {

        unsubscribeFromGifts();

        unsubscribeFromGifts =
            null;

    }

}


// ----------------------------------------------------
// LISTEN FOR GIFTS
// ----------------------------------------------------

function startGiftListener() {

    if (
        unsubscribeFromGifts
    ) {

        unsubscribeFromGifts();

    }


    const gifts =
        collection(
            db,
            "gifts"
        );


    unsubscribeFromGifts =
        onSnapshot(

            gifts,

            (snapshot) => {

                giftCache.clear();


                snapshot.forEach(
                    (giftDocument) => {

                        giftCache.set(
                            giftDocument.id,
                            giftDocument.data()
                        );

                    }
                );


                renderGiftList();

            },

            (error) => {

                console.error(
                    "Gift listener error:",
                    error
                );


                giftAdminList.textContent =
                    "Could not load gifts.";

            }

        );

}


// ----------------------------------------------------
// RENDER GIFTS
// ----------------------------------------------------

function renderGiftList() {

    giftAdminList.innerHTML =
        "";


    if (
        giftCache.size === 0
    ) {

        giftAdminList.textContent =
            "No gifts have been added yet.";

        return;

    }


    const gifts =
        [...giftCache.entries()]
            .sort(
                (
                    [, giftA],
                    [, giftB]
                ) => {

                    const recipientCompare =
                        (
                            giftA.recipient ||
                            ""
                        )
                        .localeCompare(
                            giftB.recipient ||
                            ""
                        );


                    if (
                        recipientCompare !==
                        0
                    ) {

                        return recipientCompare;

                    }


                    return (
                        giftA.name ||
                        ""
                    )
                    .localeCompare(
                        giftB.name ||
                        ""
                    );

                }
            );


    gifts.forEach(
        (
            [
                id,
                gift
            ]
        ) => {

            const giftElement =
                document.createElement(
                    "div"
                );


            giftElement.className =
                "admin-gift";


            let statusClass =
                "status-available";


            let statusText =
                "Available";


            if (
                gift.reusable === true
            ) {

                statusClass =
                    "status-reusable";


                statusText =
                    "Reusable";

            } else if (
                gift.claimed === true
            ) {

                statusClass =
                    "status-claimed";


                statusText =
                    "Claimed";

            }


            giftElement.innerHTML = `

                <div class="admin-gift-top">

                    <div>

                        <h3>
                            ${escapeHtml(
                                gift.name ||
                                "Unnamed Gift"
                            )}
                        </h3>

                        <p>
                            For:
                            <strong>
                                ${escapeHtml(
                                    gift.recipient ||
                                    ""
                                )}
                            </strong>
                        </p>

                        <p>
                            Price:
                            ${escapeHtml(
                                formatAdminPrice(
                                    gift.price
                                )
                            )}
                        </p>

                    </div>


                    <span
                        class="
                            status
                            ${statusClass}
                        ">

                        ${statusText}

                    </span>

                </div>


                <div class="gift-actions">

                    <button
                        class="secondary-button"
                        data-action="edit"
                        data-id="${id}">

                        Edit

                    </button>


                    ${
                        gift.claimed === true &&
                        gift.reusable !== true

                            ? `
                                <button
                                    class="primary-button"
                                    data-action="reset"
                                    data-id="${id}">

                                    Reset Claim

                                </button>
                            `

                            : ""
                    }


                    <button
                        class="danger-button"
                        data-action="delete"
                        data-id="${id}">

                        Delete

                    </button>

                </div>

            `;


            giftAdminList.appendChild(
                giftElement
            );

        }
    );

}


// ----------------------------------------------------
// ADD / SAVE GIFT
// ----------------------------------------------------

giftForm.addEventListener(

    "submit",

    async (
        event
    ) => {

        event.preventDefault();


        saveGiftButton.disabled =
            true;


        saveGiftButton.textContent =
            editingGiftId
                ? "Saving..."
                : "Adding...";


        const giftData = {

            name:
                giftName.value.trim(),


            recipient:
                giftRecipient.value,


            price:
                normalizePrice(
                    giftPrice.value
                ),


            description:
                giftDescription.value.trim(),


            url:
                giftUrl.value.trim(),


            imageUrl:
                giftImageUrl.value.trim(),


            reusable:
                giftReusable.checked

        };


        try {

            if (
                editingGiftId
            ) {

                giftData.updatedAt =
                    serverTimestamp();


                await updateDoc(

                    doc(
                        db,
                        "gifts",
                        editingGiftId
                    ),

                    giftData

                );

            } else {

                giftData.claimed =
                    false;


                giftData.createdAt =
                    serverTimestamp();


                await addDoc(

                    collection(
                        db,
                        "gifts"
                    ),

                    giftData

                );

            }


            resetGiftForm();

        } catch (
            error
        ) {

            console.error(
                "Save gift error:",
                error
            );


            alert(
                "Could not save the gift."
            );

        } finally {

            saveGiftButton.disabled =
                false;


            saveGiftButton.textContent =
                editingGiftId
                    ? "Save Changes"
                    : "Add Gift";

        }

    }

);


// ----------------------------------------------------
// ADMIN BUTTONS
// ----------------------------------------------------

giftAdminList.addEventListener(

    "click",

    async (
        event
    ) => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (
            !button
        ) {

            return;

        }


        const id =
            button.dataset.id;


        const action =
            button.dataset.action;


        if (
            action === "edit"
        ) {

            editGift(
                id
            );

        }


        if (
            action === "reset"
        ) {

            await resetClaim(
                id
            );

        }


        if (
            action === "delete"
        ) {

            await deleteGift(
                id
            );

        }

    }

);


// ----------------------------------------------------
// EDIT
// ----------------------------------------------------

function editGift(
    id
) {

    const gift =
        giftCache.get(
            id
        );


    if (
        !gift
    ) {

        return;

    }


    editingGiftId =
        id;


    formTitle.textContent =
        "Edit Gift";


    saveGiftButton.textContent =
        "Save Changes";


    cancelEditButton.classList.remove(
        "hidden"
    );


    giftName.value =
        gift.name ||
        "";


    giftRecipient.value =
        gift.recipient ||
        "Austin";


    giftPrice.value =
        gift.price ??
        "";


    giftDescription.value =
        gift.description ||
        "";


    giftUrl.value =
        gift.url ||
        "";


    giftImageUrl.value =
        gift.imageUrl ||
        "";


    giftReusable.checked =
        gift.reusable ===
        true;


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


// ----------------------------------------------------
// CANCEL EDIT
// ----------------------------------------------------

cancelEditButton.addEventListener(

    "click",

    () => {

        resetGiftForm();

    }

);


// ----------------------------------------------------
// RESET FORM
// ----------------------------------------------------

function resetGiftForm() {

    editingGiftId =
        null;


    giftForm.reset();


    giftRecipient.value =
        "Austin";


    formTitle.textContent =
        "Add Gift";


    saveGiftButton.textContent =
        "Add Gift";


    cancelEditButton.classList.add(
        "hidden"
    );

}


// ----------------------------------------------------
// RESET CLAIM
// ----------------------------------------------------

async function resetClaim(
    id
) {

    const gift =
        giftCache.get(
            id
        );


    if (
        !gift
    ) {

        return;

    }


    const confirmed =
        window.confirm(
            `Put "${gift.name}" back on the list?`
        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        await updateDoc(

            doc(
                db,
                "gifts",
                id
            ),

            {
                claimed:
                    false
            }

        );

    } catch (
        error
    ) {

        console.error(
            "Reset claim error:",
            error
        );


        alert(
            "Could not reset this claim."
        );

    }

}


// ----------------------------------------------------
// DELETE
// ----------------------------------------------------

async function deleteGift(
    id
) {

    const gift =
        giftCache.get(
            id
        );


    if (
        !gift
    ) {

        return;

    }


    const confirmed =
        window.confirm(
            `Delete "${gift.name}" permanently?`
        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "gifts",
                id
            )

        );


        if (
            editingGiftId ===
            id
        ) {

            resetGiftForm();

        }

    } catch (
        error
    ) {

        console.error(
            "Delete gift error:",
            error
        );


        alert(
            "Could not delete this gift."
        );

    }

}


// ----------------------------------------------------
// PRICE
// ----------------------------------------------------

function normalizePrice(
    value
) {

    const trimmed =
        value.trim();


    if (
        trimmed === ""
    ) {

        return "";

    }


    const cleaned =
        trimmed
            .replaceAll(
                "$",
                ""
            )
            .replaceAll(
                ",",
                ""
            );


    const numeric =
        Number(
            cleaned
        );


    if (
        cleaned !== "" &&
        Number.isFinite(
            numeric
        )
    ) {

        return numeric;

    }


    return trimmed;

}


function formatAdminPrice(
    value
) {

    if (
        typeof value === "number"
    ) {

        return `$${value.toFixed(2)}`;

    }


    return String(
        value ??
        ""
    );

}


// ----------------------------------------------------
// SAFE HTML
// ----------------------------------------------------

function escapeHtml(
    value
) {

    return String(
        value
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        "\"",
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}