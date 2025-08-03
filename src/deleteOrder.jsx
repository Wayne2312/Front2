const deleteOrder = async (orderId) => {
  if (!window.confirm("Are you sure you want to cancel this order?")) return;
  setLoading(true);
  try {
    await axios.delete(`${API}/orders/${orderId}/`);
    await fetchOrders();
    alert("Order canceled successfully!");
  } catch (error) {
    alert('Failed to cancel order: ' + (error.response?.data?.detail || 'Unknown error'));
  } finally {
    setLoading(false);
  }
};