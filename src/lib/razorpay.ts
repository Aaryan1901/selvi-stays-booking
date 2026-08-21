export type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayCtor = new (options: RazorpayOptions) => { open: () => void };

let loader: Promise<void> | null = null;

export function loadRazorpay() {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if ((window as unknown as { Razorpay?: RazorpayCtor }).Razorpay) return Promise.resolve();
  if (!loader) {
    loader = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => {
        loader = null;
        reject(new Error("Could not load the payment window."));
      };
      document.body.appendChild(script);
    });
  }
  return loader;
}

export async function openRazorpay(options: RazorpayOptions) {
  await loadRazorpay();
  const Ctor = (window as unknown as { Razorpay: RazorpayCtor }).Razorpay;
  new Ctor(options).open();
}
