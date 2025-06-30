/**
 * Module Access Cards Component
 * Displays accessible modules as interactive cards with loading and empty states
 */
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

/**
 * Loading skeleton for module cards
 */
function LoadingCards() {
  return (
    <>
      {[1, 2, 3, 4].map((index) => (
        <motion.div key={index} variants={item}>
          <Card className="animate-pulse" role="status" aria-label={`Loading module ${index}`}>
            <CardContent className="p-6 flex items-center">
              <div className="bg-gray-200 p-3 rounded-lg mr-4 w-12 h-12" aria-hidden="true"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2" aria-hidden="true"></div>
                <div className="h-6 bg-gray-200 rounded" aria-hidden="true"></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  );
}

/**
 * Empty state when no modules are accessible
 */
function EmptyState() {
  return (
    <motion.div variants={item} className="col-span-full">
      <Card className="border-dashed border-2 border-gray-300" role="alert">
        <CardContent className="p-8 text-center">
          <ShieldAlert 
            className="h-12 w-12 text-gray-400 mx-auto mb-4" 
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Modules Available
          </h3>
          <p className="text-gray-500">
            You don&apos;t have access to any modules. Please contact your administrator.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Individual module card
 */
function ModuleCard({ moduleKey, moduleInfo }) {
  return (
    <motion.div key={moduleKey} variants={item}>
      <Link href={moduleInfo.href} aria-label={moduleInfo.ariaLabel}>
        <Card className={`hover:shadow-md transition-all cursor-pointer border-l-4 border-l-${moduleInfo.color}-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}>
          <CardContent className="p-6 flex items-center">
            <div className={`bg-${moduleInfo.color}-100 p-3 rounded-lg mr-4`} aria-hidden="true">
              <div className={`text-${moduleInfo.color}-600`}>
                {moduleInfo.icon}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Access</p>
              <h3 className="text-lg font-semibold">{moduleInfo.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{moduleInfo.description}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function ModuleAccessCards({ isLoading, accessibleModules }) {
  return (
    <motion.section 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
      variants={container}
      initial="hidden"
      animate="show"
      role="region"
      aria-label="Module access cards"
    >
      {isLoading && <LoadingCards />}
      
      {!isLoading && accessibleModules.length === 0 && <EmptyState />}
      
      {!isLoading && accessibleModules.length > 0 && 
        accessibleModules.map(([moduleKey, moduleInfo]) => (
          <ModuleCard 
            key={moduleKey} 
            moduleKey={moduleKey} 
            moduleInfo={moduleInfo} 
          />
        ))
      }
    </motion.section>
  );
}
