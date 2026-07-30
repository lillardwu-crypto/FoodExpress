import { Link } from "react-router-dom";
function AddressCard({
    address,
    onDelete,
    onSetDefault,
}) {
    const {
        addressId,
        label,
        recipientName,
        phone,
        street,
        city,
        state,
        zipCode,
        defaultAddress,
    } = address;

    return (
        <article className="address-card">
            <div className="address-card-top">
                <div className="address-card-title-group">
                    <div className="address-card-icon">
                        ⌂
                    </div>

                    <div>
                        <div className="address-card-heading">
                            <h2 className="address-card-label">
                                {label || "Address"}
                            </h2>

                            {defaultAddress && (
                                <span className="address-default-badge">
                                    Default
                                </span>
                            )}
                        </div>

                        <p className="address-recipient">
                            {recipientName}
                        </p>
                    </div>
                </div>
            </div>

            <div className="address-card-content">
                <p>{street}</p>

                <p>
                    {city}, {state} {zipCode}
                </p>

                <p className="address-phone">
                    {phone}
                </p>
            </div>

            <div className="address-card-actions">
                <Link
                    to={`/account/addresses/${addressId}/edit`}
                    className="address-action-button"
                >
                    Edit
                </Link>

                {!defaultAddress && (
                    <button
                        type="button"
                        className="address-action-button"
                        onClick={() =>
                            onSetDefault?.(
                                addressId
                            )
                        }
                    >
                        Set as default
                    </button>
                )}

                <button
                    type="button"
                    className="address-action-button address-delete-button"
                    onClick={() =>
                        onDelete?.(addressId)
                    }
                >
                    Delete
                </button>
            </div>
        </article>
    );
}

export default AddressCard;