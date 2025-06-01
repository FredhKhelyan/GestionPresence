import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-alert/10 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-montserrat font-bold text-alert mb-4">Oups, quelque chose a mal tourné !</h2>
          <p className="text-lg font-opensans text-primary/80 mb-4">{this.state.error?.message || 'Erreur inconnue'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-blue-950 text-white font-montserrat font-semibold text-lg py-2 px-6 rounded-lg hover:bg-blue-950/80 transition-all duration-300"
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
