/* VIEW : blocs de page purement visuels (aucune logique). */
import Link from "next/link";
import { Decor } from "../../components/Decor";

export const B0 = () => (
  <>
    <section className="ph"><Decor k="confiance" /><div className="box in"><span className="badge hin"><i></i>Confiance & sécurité</span><h1 className="hin" style={{'--d': ".08s"}}>Un réseau où l'on peut <span className="grad">avoir confiance.</span></h1><p className="desc hin" style={{'--d': ".16s"}}>Dans le football, les fausses promesses font des dégâts. Spora met la vérification, le contrôle des annonces et la protection des jeunes joueurs au cœur du produit.</p></div></section>
  </>
);

export const B1 = () => (
  <>
    <section className="sec"><div className="box"><div className="feat3"><div className="f3 rv" data-tilt=""><small>01 · Agents</small><h3>Statut vérifié</h3><p>Informations professionnelles et licences contrôlées avant d'attribuer un statut de vérification.</p></div><div className="f3 rv" data-tilt="" style={{'--d': ".06s"}}><small>02 · Annonces</small><h3>Opportunités contrôlées</h3><p>Pour limiter les fausses détections, les arnaques et les propositions trompeuses.</p></div><div className="f3 rv" data-tilt="" style={{'--d': ".12s"}}><small>03 · Identité</small><h3>Comptes vérifiés</h3><p>Étapes de vérification d'identité pour des profils fiables.</p></div><div className="f3 rv" data-tilt=""><small>04 · Signalement</small><h3>Signaler, bloquer</h3><p>Un profil, un message ou une annonce douteux ? Tu peux le signaler en quelques gestes.</p></div><div className="f3 rv" data-tilt="" style={{'--d': ".06s"}}><small>05 · Jeunes joueurs</small><h3>L'accord du tuteur</h3><p>Pour les mineurs, un accompagnement avec l'accord d'un tuteur.</p></div><div className="f3 rv" data-tilt="" style={{'--d': ".12s"}}><small>06 · Vie privée</small><h3>Tu gardes la main</h3><p>Des paramètres de confidentialité pour choisir ce qui est visible, dont tes coordonnées.</p></div></div><p className="note rv">Spora ne remplace ni les agents, ni les clubs, ni les académies. L'outil facilite les connexions et la circulation de l'information, sans promettre de carrière.</p></div></section>
  </>
);

