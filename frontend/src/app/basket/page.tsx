'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBasket } from '@/context/BasketContext';
import { analyzeBasket } from '@/lib/api';
import { BasketAnalysis } from '@/lib/types';

export default function BasketPage() {
  const { items, updateQuantity, removeItem, clearBasket, getItemCount } = useBasket();
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      setLoading(true);
      analyzeBasket(items.map(i => ({ category_id: i.category_id, quantity: i.quantity })))
        .then(setAnalysis)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setAnalysis(null);
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl mb-4 block">🛒</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Basket is Empty</h1>
        <p className="text-gray-500 mb-8">Add some items to see how much you can save!</p>
        <Link
          href="/"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition"
        >
          Browse Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Basket ({getItemCount()} items)</h1>
        <button
          onClick={clearBasket}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Items</h2>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.category_id} className="flex items-center gap-4 pb-4 border-b">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.category_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.category_id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.category_id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-500">Calculating savings...</p>
            </div>
          ) : analysis ? (
            <>
              {/* Savings Callout */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 text-center">
                <p className="text-lg mb-2">You Could Save</p>
                <p className="text-5xl font-bold mb-2">{analysis.savings_percent}%</p>
                <p className="text-green-100">
                  That&apos;s ${analysis.savings_vs_worst.toFixed(2)} this week
                </p>
                <p className="text-2xl font-bold mt-4">
                  ${analysis.annual_projection.toFixed(0)}/year
                </p>
              </div>

              {/* Best Single Store */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-600 mb-2">Best Single Store</h3>
                <div
                  className="text-xl font-bold"
                  style={{ color: analysis.single_store_best.color }}
                >
                  {analysis.single_store_best.store_name}
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  ${analysis.single_store_best.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">One-stop shopping</p>
              </div>

              {/* Multi-Store Optimal */}
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-500">
                <h3 className="font-semibold text-green-600 mb-2">Multi-Store Optimal</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${analysis.multi_store_total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mb-4">Maximum savings</p>
                <div className="space-y-2 text-sm">
                  {analysis.multi_store_optimal.map(item => (
                    <div key={item.category_id} className="flex justify-between">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="text-gray-500">{item.store_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worst Case */}
              <div className="bg-white rounded-xl shadow-md p-6 opacity-60">
                <h3 className="font-semibold text-gray-600 mb-2">Worst Case</h3>
                <div
                  className="text-xl font-bold"
                  style={{ color: analysis.single_store_worst.color }}
                >
                  {analysis.single_store_worst.store_name}
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  ${analysis.single_store_worst.total.toFixed(2)}
                </p>
                <p className="text-sm text-red-500">Don&apos;t shop here!</p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
