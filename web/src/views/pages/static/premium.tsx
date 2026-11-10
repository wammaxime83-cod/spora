/* VIEW : blocs de page purement visuels (aucune logique). */
import Link from "next/link";
import { Decor } from "../../components/Decor";

export const B0 = () => (
  <>
    <section className="ph"><Decor k="premium" /><div className="box in"><span className="badge hin"><i></i>Offres pour les joueurs</span><h1 className="hin" style={{'--d': ".08s"}}>Gratuit pour commencer. <span className="grad">Accessible ensuite.</span></h1><p className="desc hin" style={{'--d': ".16s"}}>Seuls les <b>joueurs</b> ont des offres payantes. Les agents, les clubs, les académies et les invités utilisent Spora <b>gratuitement</b>, sans aucune offre à payer.</p></div></section>
  </>
);

export const B1 = () => (
  <>
    <section className="sec"><div className="box"><div className="plans p4"><div className="plan rv" data-tilt=""><span className="nm">GRATUIT</span><div className="pr">0<small>FCFA</small></div><p>Pour te présenter et être trouvé.</p><ul><li>Profil vérifié</li><li>2 vidéos</li><li>Visible dans la recherche</li></ul><Link className="btn" href="/inscription/">Commencer</Link></div><div className="plan rv" data-tilt="" style={{'--d': ".06s"}}><span className="nm">STANDARD</span><div className="pr">10 000<small>FCFA / an</small></div><p>Un profil complet pour convaincre.</p><ul><li>Jusqu'à 10 vidéos</li><li>Statistiques et parcours</li><li>Alerte quand un recruteur consulte ton profil</li></ul><Link className="btn" href="/inscription/">Choisir Standard</Link></div><div className="plan pro rv" data-tilt="" style={{'--d': ".12s"}}><span className="tg">Mis en avant</span><span className="nm">PREMIUM</span><div className="pr">50 000<small>FCFA / an</small></div><p>Plus de visibilité auprès des recruteurs.</p><ul><li>Tout Standard</li><li>Profil mis en avant dans les résultats</li><li>Rapport de performance</li><li>Candidature prioritaire aux détections</li></ul><Link className="btn y" href="/inscription/">Choisir Premium</Link></div><div className="plan rv" data-tilt="" style={{'--d': ".18s"}}><span className="nm">ÉLITE</span><div className="pr">100 000<small>FCFA / an</small></div><p>Un accès direct aux professionnels.</p><ul><li>Tout Premium</li><li>Mise en relation avec des agents partenaires</li><li>Candidature aux essais organisés avec des clubs</li></ul><Link className="btn" href="/inscription/">Choisir Élite</Link></div></div><p className="note rv">Ces offres sont réservées aux profils joueurs. Agents, clubs, académies et invités : 100 % gratuit. L'offre Élite donne un accès (mise en relation, candidature), jamais une promesse d'essai ou de contrat. Les prix sont indicatifs et peuvent évoluer avant l'ouverture. Paiement annuel par mobile money, possible en plusieurs fois. Tarif réduit ou gratuit pour les joueurs des académies partenaires.</p></div></section>
  </>
);

