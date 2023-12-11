import { Link, Route } from "wouter";

function App() {
  return (
    <>
      <nav></nav>
      <main>
        <Link to="/images">Images</Link>
        <Route path="/images">About Us</Route>
      </main>
    </>
  );
}

export default App;
