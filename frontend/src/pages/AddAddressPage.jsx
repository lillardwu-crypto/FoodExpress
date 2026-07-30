import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import { createAddress } from "../api/addressApi";
import AddressForm from "../components/AddressForm";
import "./AddressFormPage.css";

function AddAddressPage() {
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [serverError, setServerError] =
        useState("");

    async function handleCreateAddress(
        addressData
    ) {
        try {
            setIsSubmitting(true);
            setServerError("");

            await createAddress(addressData);

            navigate("/account/addresses");
        } catch (error) {
            console.error(
                "Failed to create address:",
                error
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                setServerError(
                    "Your session has expired. Please log in again."
                );

                return;
            }

            setServerError(
                error.response?.data?.message ||
                    "Unable to save this address. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="address-form-page">
            <div className="address-form-page-container">
                <Link
                    to="/account/addresses"
                    className="address-form-back-link"
                >
                    ← Back to saved addresses
                </Link>

                <header className="address-form-page-header">
                    <h1>Add an address</h1>

                    <p>
                        Enter the delivery details for
                        this address.
                    </p>
                </header>

                <section className="address-form-card">
                    <AddressForm
                        submitLabel="Save address"
                        onSubmit={
                            handleCreateAddress
                        }
                        isSubmitting={
                            isSubmitting
                        }
                        serverError={
                            serverError
                        }
                    />
                </section>
            </div>
        </main>
    );
}

export default AddAddressPage;