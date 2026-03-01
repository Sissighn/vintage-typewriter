function App() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8">
      {/* Das "Papier" in der Schreibmaschine */}
      <div className="bg-vintage-paper w-full max-w-2xl min-h-125 shadow-2xl p-12 relative border-t-30 border-gray-300">
        <h1 className="font-typewriter text-4xl mb-8 text-typewriter-dark border-b border-gray-400 pb-2">
          Vintage Typewriter
        </h1>
        <textarea
          className="w-full h-96 bg-transparent font-typewriter text-xl leading-relaxed resize-none focus:outline-none text-gray-800"
          placeholder="Fang an zu tippen..."
        />
        <div className="absolute bottom-4 right-8 font-typewriter text-sm text-gray-500">
          Modell: Sissighn-1950
        </div>
      </div>
    </div>
  );
}

export default App;
