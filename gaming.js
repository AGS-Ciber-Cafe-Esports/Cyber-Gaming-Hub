const OPEN_HOUR = 10;
const CLOSE_HOUR = 24;
const MAX_HOURS = 14;
const STORAGE_KEY = 'neonArenaGamingReservationsV2';

const stations = [

    {
        id: 1,
        type: 'PC GAMING',
        name: 'PC GAMING #01',
        icon: '🖥️',
        image: 'images/pc-gaming.jpg',
        status: 'available',
        price: 2000,
        specs: [
            'RTX 4060',
            'Ryzen 5',
            '16GB RAM',
            'Monitor 144Hz'
        ]
    },

    {
        id: 2,
        type: 'PC GAMING',
        name: 'PC GAMING #02',
        icon: '🖥️',
        image: 'images/pc-gaming.jpg',
        status: 'available',
        price: 2500,
        specs: [
            'RTX 4070',
            'Ryzen 7',
            '32GB RAM',
            'Monitor 240Hz'
        ]
    },

    {
        id: 3,
        type: 'PC GAMING',
        name: 'PC GAMING #03',
        icon: '🖥️',
        image: 'images/pc-gaming.jpg',
        status: 'available',
        price: 2200,
        specs: [
            'RTX 4060',
            'Intel i5',
            '16GB RAM',
            'Monitor 165Hz'
        ]
    },

    {
        id: 4,
        type: 'PLAYSTATION',
        name: 'PLAYSTATION #01',
        icon: '🎮',
        image: 'images/ps5.jpg',
        status: 'available',
        price: 1500,
        specs: [
            'PlayStation 5',
            'Resolución 4K',
            '2 Controles',
            'Más de 20 juegos'
        ]
    },

    {
        id: 5,
        type: 'PLAYSTATION',
        name: 'PLAYSTATION #02',
        icon: '🎮',
        image: 'images/ps5.jpg',
        status: 'available',
        price: 1500,
        specs: [
            'PlayStation 5',
            'Resolución 4K',
            '2 Controles',
            'Más de 20 juegos'
        ]
    },

    {
        id: 6,
        type: 'XBOX',
        name: 'XBOX #01',
        icon: '🕹️',
        image: 'images/xbox-series-x.jpg',
        status: 'occupied',
        price: 1400,
        specs: [
            'Xbox Series X',
            'Game Pass',
            '2 Controles',
            'Resolución 4K'
        ]
    }

];


const $ = id => document.getElementById(id);

const grid = $('stationsGrid');
const date = $('reservationDate');
const time = $('reservationTime');


let selectedStation = null;
let selectedHours = 1;
let activeFilter = 'all';
let submitting = false;


const money = n => '$' + Number(n).toLocaleString('es-AR');


const pad = n => String(n).padStart(2, '0');


function loadReservations() {

    try {

        const raw = localStorage.getItem(STORAGE_KEY);

        const data = raw
            ? JSON.parse(raw)
            : [];

        return Array.isArray(data)
            ? data
            : [];

    }

    catch (e) {

        console.warn(
            'Reservas corruptas',
            e
        );

        return [];

    }

}


function saveReservations(data) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    updateBadge();

}


function toMin(t) {

    const [h, m] = t
        .split(':')
        .map(Number);

    return h * 60 + m;

}


function fromMin(n) {

    return `${pad(Math.floor(n / 60) % 24)}:${pad(n % 60)}`;

}


function tomorrow() {

    const d = new Date();

    d.setHours(
        0,
        0,
        0,
        0
    );

    d.setDate(
        d.getDate() + 1
    );

    return d
        .toISOString()
        .split('T')[0];

}


function statusLabel(s) {

    return s === 'available'
        ? 'DISPONIBLE'
        : 'OCUPADO';

}


/* =========================
   RENDER ESTACIONES
========================= */

function renderStations() {

    const filtered = stations.filter(
        s =>
            activeFilter === 'all'
            ||
            s.type === activeFilter
    );


    grid.innerHTML = filtered.map(s => `

        <article class="station-card ${s.type
            .toLowerCase()
            .replace(' ', '-')}">

            <div class="station-card-glow"></div>


            <div class="station-card-top">

                <div>

                    <span class="station-type">

                        ${s.type}

                    </span>


                    <h3>

                        ${s.name}

                    </h3>

                </div>


                <span class="station-status ${s.status}">

                    <i></i>

                    ${statusLabel(s.status)}

                </span>

            </div>



            <!-- IMAGEN DEL EQUIPO -->

            <div class="station-image-container">

                <img
                    src="${s.image}"
                    alt="${s.name}"
                    class="station-image"
                >

            </div>



            <div class="station-spec-list">

                ${s.specs.map(
                    x => `<span>✓ ${x}</span>`
                ).join('')}

            </div>



            <div class="station-footer">

                <div>

                    <small>

                        PRECIO POR HORA

                    </small>


                    <strong>

                        ${money(s.price)}

                    </strong>

                </div>


                <button
                    class="station-button"
                    data-id="${s.id}"

                    ${s.status !== 'available'
                        ? 'disabled'
                        : ''
                    }

                >

                    ${s.status === 'available'
                        ? 'RESERVAR →'
                        : 'NO DISPONIBLE'
                    }

                </button>

            </div>

        </article>

    `).join('');


    grid
        .querySelectorAll(
            '.station-button:not([disabled])'
        )
        .forEach(
            b =>
                b.onclick =
                    () =>
                        openStation(
                            Number(
                                b.dataset.id
                            )
                        )
        );


    updateStats();

}


/* =========================
   ESTADÍSTICAS
========================= */

function updateStats() {

    $('availableCount').textContent =
        stations.filter(
            s =>
                s.status === 'available'
        ).length;


    $('totalStations').textContent =
        stations.length;

}


function updateBadge() {

    $('reservationBadge').textContent =
        loadReservations().length;

}


/* =========================
   MODALES
========================= */

function openModal(id) {

    $(id)
        .classList
        .add('active');


    $(id)
        .setAttribute(
            'aria-hidden',
            'false'
        );


    document.body
        .classList
        .add('modal-open');

}


function closeModal(id) {

    $(id)
        .classList
        .remove('active');


    $(id)
        .setAttribute(
            'aria-hidden',
            'true'
        );


    if (
        !document.querySelector(
            '.modal.active'
        )
    ) {

        document.body
            .classList
            .remove('modal-open');

    }

}


/* =========================
   ABRIR ESTACIÓN
========================= */

function openStation(id) {

    selectedStation =
        stations.find(
            s => s.id === id
        );


    selectedHours = 1;


    date.value = '';


    time.innerHTML = `
    
        <option value="">
        
            Seleccionar horario
            
        </option>
        
    `;


    $('stationDetails').innerHTML = `

        <div class="station-modal-head">


            <div class="station-modal-image">

                <img
                    src="${selectedStation.image}"
                    alt="${selectedStation.name}"
                >

            </div>


            <div>

                <span class="station-modal-type">

                    ${selectedStation.type}

                </span>


                <h2 id="stationModalTitle">

                    ${selectedStation.name}

                </h2>


                <div class="station-price-inline">

                    ${money(selectedStation.price)}

                    <small>

                        / HORA

                    </small>

                </div>

            </div>


        </div>



        <div class="station-specs">

            ${selectedStation.specs.map(
                s => `<span>✓ ${s}</span>`
            ).join('')}

        </div>

    `;


    clearValidation();


    updateSummary();


    openModal(
        'stationModal'
    );

}


/* =========================
   HORARIOS
========================= */

function buildTimes() {

    const reservations =
        loadReservations();


    time.innerHTML = `
    
        <option value="">
        
            Seleccionar horario
            
        </option>
        
    `;


    if (!date.value) {

        $('timeHint').textContent =
            'Seleccioná una fecha para ver los horarios.';

        return;

    }


    for (
        let h = OPEN_HOUR;
        h < CLOSE_HOUR;
        h++
    ) {

        const value =
            `${pad(h)}:00`;


        const occupied =
            reservations.some(
                r =>

                    r.stationId === selectedStation.id

                    &&

                    r.date === date.value

                    &&

                    toMin(value) >=
                    toMin(r.startTime)

                    &&

                    toMin(value) <
                    toMin(r.endTime)
            );


        const opt =
            document.createElement(
                'option'
            );


        opt.value =
            value;


        opt.textContent =
            occupied
                ? `${value} · OCUPADO`
                : `${value} · DISPONIBLE`;


        opt.disabled =
            occupied;


        time.appendChild(
            opt
        );

    }


    $('timeHint').textContent =
        'Los horarios ocupados se muestran bloqueados.';

}


/* =========================
   HORAS MÁXIMAS
========================= */

function maxHoursForSelection() {

    if (!time.value)
        return MAX_HOURS;


    const closing =
        CLOSE_HOUR * 60
        -
        toMin(time.value);


    let max =
        Math.min(
            MAX_HOURS,
            Math.floor(
                closing / 60
            )
        );


    const reservations =
        loadReservations()
            .filter(
                r =>

                    r.stationId ===
                    selectedStation.id

                    &&

                    r.date ===
                    date.value

                    &&

                    toMin(r.startTime) >
                    toMin(time.value)
            );


    if (reservations.length) {

        const next =
            Math.min(
                ...reservations.map(
                    r =>
                        toMin(
                            r.startTime
                        )
                )
            );


        max =
            Math.min(
                max,

                Math.floor(
                    (
                        next -
                        toMin(time.value)
                    ) / 60
                )
            );

    }


    return Math.max(
        1,
        max
    );

}


/* =========================
   CONFLICTOS
========================= */

function hasConflict(
    start,
    hours
) {

    if (
        !selectedStation
        ||
        !date.value
        ||
        !time.value
    )
        return false;


    const a =
        toMin(start);


    const b =
        a +
        hours * 60;


    return loadReservations().some(
        r =>

            r.stationId ===
            selectedStation.id

            &&

            r.date ===
            date.value

            &&

            a <
            toMin(r.endTime)

            &&

            b >
            toMin(r.startTime)

    );

}


/* =========================
   RESUMEN
========================= */

function updateSummary() {

    const max =
        maxHoursForSelection();


    if (
        selectedHours > max
    )
        selectedHours = max;


    $('hoursValue').textContent =
        selectedHours;


    $('hoursLabel').textContent =
        selectedHours === 1
            ? 'HORA'
            : 'HORAS';


    $('maxHoursHint').textContent =
        time.value

            ?

            `Máximo ${max} ${
                max === 1
                    ? 'hora'
                    : 'horas'
            } para este horario.`

            :

            'Máximo 14 horas.';


    $('decreaseHours').disabled =
        selectedHours <= 1;


    $('increaseHours').disabled =
        selectedHours >= max;


    $('reservationDuration').textContent =
        `${selectedHours} ${
            selectedHours === 1
                ? 'HORA'
                : 'HORAS'
        }`;


    $('reservationPrice').textContent =
        selectedStation
            ? money(
                selectedStation.price
            )
            : '$0';


    const total =
        selectedStation
            ? selectedStation.price *
            selectedHours
            : 0;


    $('reservationTotal').textContent =
        money(total);


    $('reserveButtonPrice').textContent =
        money(total);


    if (time.value) {

        const end =
            toMin(time.value)
            +
            selectedHours * 60;


        $('reservationEndTime').textContent =
            end <= CLOSE_HOUR * 60
                ? fromMin(end)
                : '--:--';

    }

    else {

        $('reservationEndTime').textContent =
            '--:--';

    }

}


/* =========================
   VALIDACIÓN
========================= */

function validate() {

    clearValidation();


    if (!selectedStation)
        return showValidation(
            'Seleccioná un puesto.'
        );


    if (!date.value)
        return showValidation(
            'Seleccioná una fecha para continuar.'
        );


    if (
        date.value <
        tomorrow()
    )
        return showValidation(
            'La reserva debe realizarse con al menos un día de anticipación.'
        );


    if (!time.value)
        return showValidation(
            'Seleccioná una hora de inicio.'
        );


    if (
        toMin(time.value)
        +
        selectedHours * 60
        >
        CLOSE_HOUR * 60
    )
        return showValidation(
            'La reserva supera el horario de cierre.'
        );


    if (
        hasConflict(
            time.value,
            selectedHours
        )
    )
        return showValidation(
            'Existe una reserva que se superpone con ese horario.'
        );


    return true;

}


function showValidation(msg) {

    const el =
        $('validationMessage');


    el.textContent =
        '⚠ ' + msg;


    el.classList.add(
        'show'
    );


    return false;

}


function clearValidation() {

    $('validationMessage').textContent =
        '';


    $('validationMessage')
        .classList
        .remove('show');

}


/* =========================
   CÓDIGO
========================= */

function code() {

    return (
        'NA-'
        +
        crypto
            .getRandomValues(
                new Uint32Array(1)
            )[0]
            .toString(36)
            .toUpperCase()
            .slice(-6)
            .padStart(
                6,
                '0'
            )
    );

}


/* =========================
   CREAR RESERVA
========================= */

function createReservation() {

    if (
        submitting
        ||
        !validate()
    )
        return;


    submitting = true;


    const c =
        code();


    const end =
        fromMin(
            toMin(time.value)
            +
            selectedHours * 60
        );


    const r = {

        code: c,

        stationId:
            selectedStation.id,

        stationName:
            selectedStation.name,

        stationType:
            selectedStation.type,

        date:
            date.value,

        startTime:
            time.value,

        endTime:
            end,

        hours:
            selectedHours,

        total:
            selectedStation.price
            *
            selectedHours,

        status:
            'Reservado',

        createdAt:
            new Date()
                .toISOString()

    };


    const all =
        loadReservations();


    all.push(r);


    saveReservations(all);


    $('successReservationCode').textContent =
        c;


    $('successDetails').innerHTML = `

        <div>

            <span>
            
                ESTACIÓN
                
            </span>

            <strong>
            
                ${r.stationName}
                
            </strong>

        </div>


        <div>

            <span>
            
                HORARIO
                
            </span>

            <strong>

                ${r.date
                    .split('-')
                    .reverse()
                    .join('/')}

                ·

                ${r.startTime}

                —

                ${r.endTime}

            </strong>

        </div>


        <div>

            <span>
            
                TOTAL
                
            </span>

            <strong>
            
                ${money(r.total)}
                
            </strong>

        </div>

    `;


    closeModal(
        'stationModal'
    );


    openModal(
        'successModal'
    );


    toast(
        'Reserva confirmada correctamente',
        'success'
    );


    submitting = false;

}


/* =========================
   MIS RESERVAS
========================= */

function renderReservations() {

    const list =
        $('reservationsList');


    const all =
        loadReservations()
            .sort(
                (a, b) =>
                    b.createdAt
                        .localeCompare(
                            a.createdAt
                        )
            );


    if (!all.length) {

        list.innerHTML = `

            <div class="empty-state">

                <div>
                
                    🎮
                    
                </div>

                <h3>
                
                    AÚN NO TENÉS RESERVAS
                    
                </h3>

                <p>

                    Cuando reserves una estación,
                    aparecerá acá.

                </p>

            </div>

        `;

        return;

    }


    list.innerHTML =
        all.map(
            r => `

            <article class="reservation-item">


                <div class="reservation-item-top">


                    <div>

                        <span>
                        
                            ${r.stationType}
                            
                        </span>

                        <h3>
                        
                            ${r.stationName}
                            
                        </h3>

                    </div>


                    <button
                        class="cancel-button"
                        data-code="${r.code}"
                    >

                        CANCELAR

                    </button>


                </div>



                <div class="reservation-data">

                    <span>

                        📅

                        ${r.date
                            .split('-')
                            .reverse()
                            .join('/')}

                    </span>


                    <span>

                        🕐

                        ${r.startTime}

                        —

                        ${r.endTime}

                    </span>


                    <span>

                        ⏱

                        ${r.hours}

                        ${
                            r.hours === 1
                                ? 'hora'
                                : 'horas'
                        }

                    </span>


                    <strong>

                        ${money(r.total)}

                    </strong>


                </div>


                <div class="reservation-code">

                    CÓDIGO:

                    <b>

                        ${r.code}

                    </b>

                </div>


            </article>

        `
        )
        .join('');


    list
        .querySelectorAll(
            '.cancel-button'
        )
        .forEach(
            b =>
                b.onclick =
                    () =>
                        cancelReservation(
                            b.dataset.code
                        )
        );

}


function cancelReservation(c) {

    if (
        !confirm(
            '¿Seguro que querés cancelar esta reserva?'
        )
    )
        return;


    saveReservations(

        loadReservations()
            .filter(
                r =>
                    r.code !== c
            )

    );


    renderReservations();


    toast(
        'Reserva cancelada correctamente',
        'info'
    );

}


/* =========================
   NOTIFICACIONES
========================= */

function toast(
    msg,
    type = 'info'
) {

    const el =
        document.createElement(
            'div'
        );


    el.className =
        `toast ${type}`;


    el.textContent =
        msg;


    $('toastContainer')
        .appendChild(el);


    setTimeout(
        () =>
            el.classList.add(
                'show'
            ),
        10
    );


    setTimeout(
        () => {

            el.classList.remove(
                'show'
            );


            setTimeout(
                () =>
                    el.remove(),
                300
            );

        },
        3200
    );

}


/* =========================
   EVENTOS
========================= */

date.min =
    tomorrow();


date.addEventListener(
    'change',
    () => {

        buildTimes();

        selectedHours = 1;

        updateSummary();

    }
);


time.addEventListener(
    'change',
    () => {

        clearValidation();

        updateSummary();

    }
);


$('decreaseHours').onclick =
    () => {

        if (
            selectedHours > 1
        ) {

            selectedHours--;

            updateSummary();

        }

    };


$('increaseHours').onclick =
    () => {

        if (
            selectedHours <
            maxHoursForSelection()
        ) {

            selectedHours++;

            updateSummary();

        }

    };


$('reserveStationButton').onclick =
    createReservation;


$('successButton').onclick =
    () =>
        closeModal(
            'successModal'
        );


$('myReservationsButton').onclick =
    () => {

        renderReservations();

        openModal(
            'reservationsModal'
        );

    };


$('heroReservationsButton').onclick =
    () => {

        renderReservations();

        openModal(
            'reservationsModal'
        );

    };


document
    .querySelectorAll(
        '[data-close]'
    )
    .forEach(
        b =>
            b.onclick =
                () =>
                    closeModal(
                        b.dataset.close
                    )
    );


document.addEventListener(
    'keydown',
    e => {

        if (
            e.key === 'Escape'
        ) {

            document
                .querySelectorAll(
                    '.modal.active'
                )
                .forEach(
                    m =>
                        closeModal(
                            m.id
                        )
                );

        }

    }
);


$('stationFilters')
    .querySelectorAll(
        '.filter'
    )
    .forEach(
        b =>
            b.onclick =
                () => {

                    activeFilter =
                        b.dataset.filter;


                    document
                        .querySelectorAll(
                            '.filter'
                        )
                        .forEach(
                            x =>
                                x.classList
                                    .remove('active')
                        );


                    b.classList.add(
                        'active'
                    );


                    renderStations();

                }
    );


renderStations();

updateBadge();