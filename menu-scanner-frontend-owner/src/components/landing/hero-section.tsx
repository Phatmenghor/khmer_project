"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, BarChart3, QrCode, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/app-routes/routes";

export default function HeroSection() {
  return (
    <section className="bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — Text */}
          <div className="animate-fade-in-up">
            <Badge variant="outline" className="mb-5 border-primary/30 text-primary bg-primary/5">
              🚀 Trusted by 500+ Restaurants in Cambodia
            </Badge>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight tracking-tight mb-5">
              Your Restaurant,{" "}
              <span className="text-primary">
                Powered by Smart Digital Menus
              </span>
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Boost sales, reduce wait times, and delight guests with QR code
              ordering, real-time management, and powerful analytics — all in one platform.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Button size="lg" asChild>
                <Link href={ROUTES.PUBLIC.REGISTER}>
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                "No credit card required",
                "14-day free trial",
                "Cancel anytime",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="relative animate-fade-in">
            <Card className="shadow-2xl border-border/60 overflow-hidden">
              {/* Card header bar */}
              <div className="bg-primary/5 border-b border-border px-5 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
                <span className="ml-3 text-xs font-medium text-muted-foreground">eMenu Dashboard</span>
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: ShoppingBag, label: "Orders Today", value: "142", color: "text-primary" },
                    { icon: BarChart3, label: "Revenue", value: "$2,840", color: "text-green-600" },
                    { icon: QrCode, label: "Menu Scans", value: "318", color: "text-blue-600" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-muted/60 rounded-lg p-3">
                      <Icon className={`h-4 w-4 ${color} mb-1`} />
                      <div className={`text-lg font-bold ${color}`}>{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Recent Orders
                  </div>
                  {[
                    { table: "Table 5", items: "Beef Lok Lak × 2, Iced Coffee × 2", status: "Preparing", color: "bg-yellow-100 text-yellow-700" },
                    { table: "Table 2", items: "Green Mango Salad × 1, Fresh Juice × 3", status: "Ready", color: "bg-green-100 text-green-700" },
                    { table: "Table 8", items: "Grilled Fish × 2, Rice × 2", status: "New", color: "bg-primary/10 text-primary" },
                  ].map((order) => (
                    <div
                      key={order.table}
                      className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{order.table}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">{order.items}</div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.color}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Floating ping badge */}
            <div className="absolute -top-3 -right-3 flex items-center gap-1.5 bg-background border border-border rounded-full px-3 py-1.5 shadow-md text-xs font-semibold text-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              3 New Orders
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
