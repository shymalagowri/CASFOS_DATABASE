import React, { useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import axios from "axios";

const username = "";

const AssetManagement = () => {
  const [assetType, setAssetType] = useState("");
  const [asset, setAsset] = useState("");
  const [location, setLocation] = useState("");
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [price, setPrice] = useState("");
  const [sno, setSno] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [address, setAddress] = useState("");
  const [takenBy, setTakenBy] = useState("");
  const [showAddUpdateFields, setShowAddUpdateFields] = useState(false);
  const [quantityBought, setQuantityBought] = useState("");
  const [billNo, setBillNo] = useState("");
  const [date, setDate] = useState("");
  const [quantityReceived, setQuantityReceived] = useState("");
  const [pricePaid, setPricePaid] = useState("");
  const [numberIssued, setNumberIssued] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [priceReceived, setPriceReceived] = useState("");
  const [balanceInHand, setBalanceInHand] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState([]); // For Consumable items only

  // Asset options based on assetType
  const permanentAssetOptions = [
    "Furniture",
    "Vehicle",
    "Building",
    "Library",
    "Instruments",
    "Sports and Goods",
    "Curtains",
  ];
  const consumableAssetOptions = [
    "Stationery",
    "IT",
    "Electrical",
    "Plumbing",
    "Glassware/Laboratory Items",
    "Sanitory Items",
    "Sports Goods",
    "Beds and Pillows",
    "Instruments",
  ];
  const assetOptions = assetType === "Permanent" ? permanentAssetOptions : consumableAssetOptions;

  // Updated location options for both Permanent and Consumable
  const locationOptions = [
    { value: "faculty_chamber", label: "Faculty Chamber" },
    { value: "officer_quarters", label: "Officer Quarters" },
    { value: "staff_quarters", label: "Staff Quarters" },
    { value: "corbett_hall", label: "Corbett Hall" },
    { value: "champion_hall", label: "Champion Hall" },
    { value: "gis_lab", label: "GIS Lab" },
    { value: "van_vatika", label: "Van Vatika" },
    { value: "hostel", label: "Hostel" },
    { value: "officers_mess", label: "Officers Mess" },
    { value: "van_sakthi", label: "Van Sakthi" },
    { value: "library", label: "Library" },
    { value: "classroom", label: "Classroom" },
    { value: "office_room", label: "Office Room" },
    { value: "officers_lounge", label: "Officer's Lounge" },
    { value: "gymnasium", label: "Gymnasium" },
  ];

  const handleAssetTypeChange = (e) => {
    const selected = e.target.value;
    setAssetType(selected);
    setShowDropdowns(selected === "Consumable" || selected === "Permanent");
    setShowButtons(true);
    setShowPriceInput(false);
    setShowAddUpdateFields(false);
    setItems([]);
    setAsset("");
    setLocation(""); // Reset location when asset type changes
  };

  const handleButtonClick = (action) => {
    if (action === "Add/Update") {
      setShowAddUpdateFields(true);
      setShowPriceInput(true);
    } else {
      setShowAddUpdateFields(false);
      setShowPriceInput(false);
    }
  };

  const addItem = () => {
    const newItem = {
      itemName: "",
      purchaseDate: "",
      inStock: "",
      received: "",
      issued: "",
      remaining: "",
      price: "",
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleSave = async () => {
    try {
      let payload;
      if (assetType === "Permanent") {
        payload = {
          assetType: "Permanent",
          asset,
          location,
          entryDate,
          quantityBought,
          billNo,
          date,
          quantityReceived,
          pricePaid,
          numberIssued,
          issuedTo,
          priceReceived,
          balanceInHand,
          remarks,
        };
      } else if (assetType === "Consumable") {
        payload = {
          assetType: "Consumable",
          asset,
          location,
          sno,
          entryDate,
          invoiceNo,
          address,
          takenBy,
          items: items.map((item) => ({
            itemName: item.itemName,
            purchaseDate: item.purchaseDate,
            inStock: item.inStock,
            received: item.received,
            issued: item.issued,
            remaining: item.remaining,
            price: item.price,
          })),
        };
      }

      const response = await axios.post("http://localhost:3001/api/assets/save", payload);
      alert(response.data.message);
      resetForm();
    } catch (error) {
      alert("Error saving asset: " + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setAssetType("");
    setAsset("");
    setLocation("");
    setPrice("");
    setSno("");
    setEntryDate("");
    setInvoiceNo("");
    setAddress("");
    setTakenBy("");
    setItems([]);
    setQuantityBought("");
    setBillNo("");
    setDate("");
    setQuantityReceived("");
    setPricePaid("");
    setNumberIssued("");
    setIssuedTo("");
    setPriceReceived("");
    setBalanceInHand("");
    setRemarks("");
    setShowAddUpdateFields(false);
    setShowPriceInput(false);
    setShowDropdowns(false);
    setShowButtons(false);
  };

  return (
    <div style={{ display: "flex" }}>
      <title>CASFOS</title>
      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">DATA ENTRY STAFF</span>
        </a>
        <ul className="side-menu top">
          <li>
            <a href={`/dataentrydashboard?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-dashboard" />
              <span className="text">Home</span>
            </a>
          </li>
          <li className="active">
            <a href={`/assetentry?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Entry</span>
            </a>
          </li>
          <li>
            <a href={`/rejectedassets?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Rejected Assets</span>
            </a>
          </li>
          <li>
            <a href={`/facultyentry?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty Entry</span>
            </a>
          </li>
          <li>
            <a href={`/facultyupdation?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-doughnut-chart" />
              <span className="text">Faculty Updation</span>
            </a>
          </li>
        </ul>
        <ul className="side-menu">
          <li>
            <a href="/" className="logout">
              <i className="bx bxs-log-out-circle" />
              <span className="text">Logout</span>
            </a>
          </li>
        </ul>
      </section>

      <div
        style={{
          marginLeft: "22%",
          width: "78%",
          padding: "50px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px" }}>Asset Management</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Asset Type:</label>
          <select
            onChange={handleAssetTypeChange}
            value={assetType}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
          >
            <option value="">Select Asset Type</option>
            <option value="Permanent">Permanent</option>
            <option value="Consumable">Consumable</option>
          </select>
          <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
            <button
              onClick={() => handleButtonClick("Add/Update")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2ecc71",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>

          {showAddUpdateFields && (
            <>
              {assetType === "Consumable" || assetType === "Permanent" ? (
                <>
                  {showDropdowns && (
                    <>
                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Asset:</label>
                      <select
                        onChange={(e) => setAsset(e.target.value)}
                        value={asset}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      >
                        <option value="">Select Asset</option>
                        {assetOptions.map((item, index) => (
                          <option key={index} value={item}>{item}</option>
                        ))}
                      </select>

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Location:</label>
                      <select
                        onChange={(e) => setLocation(e.target.value)}
                        value={location}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      >
                        <option value="">Select Location</option>
                        {locationOptions.map((loc, index) => (
                          <option key={index} value={loc.value}>{loc.label}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {assetType === "Consumable" ? (
                    <>
                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Sno:</label>
                      <input
                        type="number"
                        value={sno}
                        onChange={(e) => setSno(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Entry Date:</label>
                      <input
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Invoice No:</label>
                      <input
                        type="text"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Address:</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Taken By:</label>
                      <input
                        type="text"
                        value={takenBy}
                        onChange={(e) => setTakenBy(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <button
                        onClick={addItem}
                        style={{
                          width: "150px",
                          padding: "10px",
                          backgroundColor: "#3498db",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          marginTop: "20px",
                        }}
                      >
                        Add Item
                      </button>

                      {items.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            border: "1px solid #ccc",
                            padding: "20px",
                            marginTop: "20px",
                            borderRadius: "5px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Item {index + 1}</h3>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "15px",
                            }}
                          >
                            <div>
                              <label style={{ fontWeight: "bold", color: "#2c3e50", display: "block", marginBottom: "5px" }}>
                                Item Name:
                              </label>
                              <input
                                type="text"
                                value={item.itemName}
                                onChange={(e) => updateItem(index, "itemName", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                  fontSize: "16px",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", color: "#2c3e50", display: "block", marginBottom: "5px" }}>
                                Purchase Date:
                              </label>
                              <input
                                type="date"
                                value={item.purchaseDate}
                                onChange={(e) => updateItem(index, "purchaseDate", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                  fontSize: "16px",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", color: "#2c3e50", display: "block", marginBottom: "5px" }}>
                                In Stock:
                              </label>
                              <input
                                type="number"
                                value={item.inStock}
                                onChange={(e) => updateItem(index, "inStock", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                  fontSize: "16px",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", color: "#2c3e50", display: "block", marginBottom: "5px" }}>
                                Received:
                              </label>
                              <input
                                type="number"
                                value={item.received}
                                onChange={(e) => updateItem(index, "received", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                  fontSize: "16px",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", color: "#2c3e50", display: "block", marginBottom: "5px" }}>
                                Issued:
                              </label>
                              <input
                                type="number"
                                value={item.issued}
                                onChange={(e) => updateItem(index, "issued", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                  fontSize: "16px",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", color: "#2c3e50", display: "block", marginBottom: "5px" }}>
                                Remaining:
                              </label>
                              <input
                                type="number"
                                value={item.remaining}
                                onChange={(e) => updateItem(index, "remaining", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                  fontSize: "16px",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", color: "#2c3e50", display: "block", marginBottom: "5px" }}>
                                Price:
                              </label>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItem(index, "price", e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                  fontSize: "16px",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(index)}
                            style={{
                              width: "150px",
                              padding: "10px",
                              backgroundColor: "#e74c3c",
                              color: "#fff",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              marginTop: "15px",
                            }}
                          >
                            Remove Item
                          </button>
                        </div>
                      ))}
                    </>
                  ) : assetType === "Permanent" ? (
                    <>
                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Entry Date:</label>
                      <input
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Quantity Bought:</label>
                      <input
                        type="number"
                        value={quantityBought}
                        onChange={(e) => setQuantityBought(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <h3 style={{ color: "#2c3e50", marginTop: "20px" }}>Receipts</h3>
                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Bill No:</label>
                      <input
                        type="text"
                        value={billNo}
                        onChange={(e) => setBillNo(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Purchase Date:</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Quantity Received:</label>
                      <input
                        type="number"
                        value={quantityReceived}
                        onChange={(e) => setQuantityReceived(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Price Paid:</label>
                      <input
                        type="number"
                        value={pricePaid}
                        onChange={(e) => setPricePaid(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <h3 style={{ color: "#2c3e50", marginTop: "20px" }}>Issued</h3>
                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Number Issued:</label>
                      <input
                        type="number"
                        value={numberIssued}
                        onChange={(e) => setNumberIssued(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Issued To:</label>
                      <input
                        type="text"
                        value={issuedTo}
                        onChange={(e) => setIssuedTo(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Price Received if Sold:</label>
                      <input
                        type="number"
                        value={priceReceived}
                        onChange={(e) => setPriceReceived(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Balance in Hand:</label>
                      <input
                        type="number"
                        value={balanceInHand}
                        onChange={(e) => setBalanceInHand(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px", backgroundColor: "#f4f4f4" }}
                      />

                      <label style={{ fontWeight: "bold", color: "#2c3e50" }}>Remarks:</label>
                      <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
                      />
                    </>
                  ) : null}
                  <button
                    onClick={handleSave}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#27ae60",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginTop: "20px",
                    }}
                  >
                    Save
                  </button>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetManagement;