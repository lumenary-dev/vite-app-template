import { useEffect, useState } from "react";
import * as sdk from "../lib/sdk/";

type SDKFunction = {
  name: string;
  parameters: string[];
  returnType: string;
};

type SDKType = {
  name: string;
  properties: Record<string, string>;
};

function DebugSdk() {
  const [types, setTypes] = useState<SDKType[]>([]);
  const [functions, setFunctions] = useState<SDKFunction[]>([]);
  const [activeTab, setActiveTab] = useState<"types" | "functions">("types");
  const [selectedItem, setSelectedItem] = useState<string>("");

  useEffect(() => {
    // Extract types and functions from SDK
    const sdkTypes: SDKType[] = [];
    const sdkFunctions: SDKFunction[] = [];

    Object.entries(sdk).forEach(([key, value]) => {
      if (typeof value === "function") {
        sdkFunctions.push({
          name: key,
          parameters: getFunctionParameters(value),
          returnType: getFunctionReturnType(value),
        });
      } else if (key.includes("Schema") || key.includes("Data") || key.includes("Response")) {
        sdkTypes.push({
          name: key,
          properties: getTypeProperties(value),
        });
      }
    });

    setTypes(sdkTypes);
    setFunctions(sdkFunctions);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">SDK Explorer</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("types")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "types" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Types ({types.length})
          </button>
          <button
            onClick={() => setActiveTab("functions")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "functions" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Functions ({functions.length})
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* List Panel */}
          <div className="col-span-1 bg-white rounded-lg shadow p-4">
            {activeTab === "types" ? (
              <div className="space-y-2">
                {types.map((type) => (
                  <button
                    key={type.name}
                    onClick={() => setSelectedItem(type.name)}
                    className={`w-full text-left p-2 rounded hover:bg-gray-50 ${
                      selectedItem === type.name ? "bg-gray-50" : ""
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {functions.map((func) => (
                  <button
                    key={func.name}
                    onClick={() => setSelectedItem(func.name)}
                    className={`w-full text-left p-2 rounded hover:bg-gray-50 ${
                      selectedItem === func.name ? "bg-gray-50" : ""
                    }`}
                  >
                    {func.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="col-span-2 bg-white rounded-lg shadow p-4">
            {selectedItem && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{selectedItem}</h2>
                {activeTab === "types" ? (
                  <pre className="bg-gray-50 p-4 rounded overflow-auto">
                    {JSON.stringify(types.find((t) => t.name === selectedItem)?.properties, null, 2)}
                  </pre>
                ) : (
                  <div className="space-y-4">
                    {functions.find((f) => f.name === selectedItem) && (
                      <>
                        <div>
                          <h3 className="font-medium mb-2">Parameters:</h3>
                          <pre className="bg-gray-50 p-4 rounded">
                            {JSON.stringify(functions.find((f) => f.name === selectedItem)?.parameters, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Return Type:</h3>
                          <pre className="bg-gray-50 p-4 rounded">
                            {functions.find((f) => f.name === selectedItem)?.returnType}
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions to extract type information
function getFunctionParameters(func: Function): string[] {
  const funcStr = func.toString();
  const match = funcStr.match(/\((.*?)\)/);
  if (match && match[1]) {
    return match[1].split(",").map((param) => param.trim());
  }
  return [];
}

function getFunctionReturnType(func: Function): string {
  const funcStr = func.toString();
  const match = funcStr.match(/\): (.+?) =>/);
  return match ? match[1] : "unknown";
}

function getTypeProperties(type: any): Record<string, string> {
  if (typeof type !== "object") return {};
  return Object.entries(type).reduce(
    (acc, [key, value]) => {
      acc[key] = typeof value;
      return acc;
    },
    {} as Record<string, string>,
  );
}

export default DebugSdk;
