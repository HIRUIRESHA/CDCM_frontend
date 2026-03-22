import React from 'react';

const TestCategory = ({
  tests,
  form,
  setForm,
  editId,
  setEditId,
  handleSave,
  handleEdit,
  handleDelete,
  onBack
}) => {

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20 font-sans">

      
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ←
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold">Laboratory Management</h2>
            <p className="text-xs text-slate-500">Manage test categories</p>
          </div>

          <div className="text-blue-700 bg-blue-50 px-4 py-2 rounded-xl font-semibold">
            Total Tests: {tests.length}
          </div>
        </div>
      </div>

     
      <div className="max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* form */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl ">
            <h3 className="text-xl font-bold mb-6">
              {editId ? "Update Test" : "Add New Test"}
            </h3>

            <input
              value={form.testName}
              onChange={(e) =>
                setForm({ ...form, testName: e.target.value })
              }
              placeholder="Test Name"
              className="w-full mb-4 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />

            {/* price */}
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              placeholder="Price"
              className="w-full mb-6 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />

            
            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 ${
                editId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {editId ? "Update Test" : "Save Test"}
            </button>

            {editId && (
              <button
                onClick={() => {
                  setEditId(null);
                  setForm({ testName: "", price: "" });
                }}
                className="w-full mt-4 py-3 rounded-xl font-semibold text-red-500 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 transition-all"
              >
                Cancel Editing
              </button>
            )}
          </div>
        </div>

      
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-5 text-left text-sm font-semibold text-slate-600">Test Name</th>
                <th className="p-5 text-left text-sm font-semibold text-slate-600">Price</th>
                <th className="p-5 text-right text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 font-medium text-slate-700">{t.testName}</td>
                  <td className="p-5 text-slate-600">Rs {t.price}</td>
                  <td className="p-5 text-right space-x-4">
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-500 font-semibold hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tests.length === 0 && (
            <div className="p-16 text-center">
              <div className="text-slate-300 text-5xl mb-4">Empty</div>
              <p className="text-slate-400">No tests available in this category.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TestCategory;